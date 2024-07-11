import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LoadingService } from '../../servicios/loading.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';
import { FirebaseServerAppSettings } from 'firebase/app';
import { FilesServiceService } from '../../servicios/files-service.service';
import { FirebaseService } from '../../servicios/firebase.service';
import { DatePipe, NgIf } from '@angular/common';
import { EChartsOption } from 'echarts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as echarts from 'echarts/core';
import jsPDF from 'jspdf';
import { Chart, ChartItem, TooltipItem, registerables } from 'chart.js';
@Component({
  selector: 'app-log-ingresos-component',
  standalone: true,
  imports: [NgxChartsModule, ReactiveFormsModule, NgIf, FormsModule,],
  templateUrl: './log-ingresos-component.component.html',
  styleUrl: './log-ingresos-component.component.css'
})
export class LogIngresosComponentComponent {
  logEntries: any[] = [];
  totalLogins = 0;
  @ViewChild('logChart') chartElement!: ElementRef;
  private chart: Chart<'line'> | undefined;

  constructor(private firebaseService: FirebaseService, private datePipe: DatePipe) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadLogEntries();
  }

  async loadLogEntries(): Promise<void> {
    try {
      this.logEntries = await this.firebaseService.getLogEntries();
      this.totalLogins = this.logEntries.length;
      this.renderChart();
    } catch (error) {
      console.error('Error al cargar los registros de ingreso:', error);
    }
  }

  renderChart(): void {
    if (!this.chartElement || !this.chartElement.nativeElement) {
      console.error('Elemento del gráfico no encontrado.');
      return;
    }

    const ctx = this.chartElement.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Contexto 2D no encontrado para el gráfico.');
      return;
    }

    const counts = this.countLoginsPerDay(this.logEntries);
    const dates = this.getDates(this.logEntries);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Ingresos al Sistema',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: true
        }]
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem: TooltipItem<'line'>) => {
                if (tooltipItem.dataset) {
                  const index = tooltipItem.dataIndex;
                  const date = dates[index];
                  const loginCount = counts[index];
                  const logEntry = this.getLogEntryForDate(date);
                  if (logEntry) {
                    return `Fecha: ${date} - Ingresos: ${loginCount} - Usuario: ${logEntry.username}`;
                  }
                }
                return '';
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    // Agregar evento de clic al gráfico
    this.chartElement.nativeElement.onclick = (event: MouseEvent) => {
      const elements = this.chart?.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
      if (elements && elements.length > 0) {
        const firstElement = elements[0];
        if (firstElement) {
          const index = firstElement.index;
          const date = dates[index];
          const logEntry = this.getLogEntryForDate(date);
          if (logEntry) {
            alert(`El usuario que ingresó el ${date} fue: ${logEntry.username}`);
          }
        }
      }
    };
  }

  countLoginsPerDay(logEntries: any[]): number[] {
    const counts: { [key: string]: number } = {};

    logEntries.forEach(entry => {
      const formattedDate = this.datePipe.transform(new Date(entry.timestamp.seconds * 1000), 'yyyy-MM-dd');
      const day = formattedDate || '';
      counts[day] = (counts[day] || 0) + 1;
    });

    // Obtener fechas ordenadas
    const dates = this.getDates(logEntries);

    // Crear un arreglo de conteos para todas las fechas en el rango
    const resultCounts: number[] = [];
    for (let date of dates) {
      resultCounts.push(counts[date] || 0);
    }

    return resultCounts;
  }

  getDates(logEntries: any[]): string[] {
    const dates: string[] = [];

    logEntries.forEach(entry => {
      const formattedDate = this.datePipe.transform(new Date(entry.timestamp.seconds * 1000), 'yyyy-MM-dd');
      if (formattedDate && !dates.includes(formattedDate)) {
        dates.push(formattedDate);
      }
    });

    return dates;
  }

  getLogEntryForDate(date: string): any | undefined {
    return this.logEntries.find(entry => {
      const formattedDate = this.datePipe.transform(new Date(entry.timestamp.seconds * 1000), 'yyyy-MM-dd');
      return formattedDate === date;
    });
  }

  downloadPDF(): void {
    const chartElement = this.chartElement.nativeElement;

    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('log_ingresos_grafico.pdf');
    });
  }
}