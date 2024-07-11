import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { EChartsOption } from 'echarts';
import { FilesServiceService } from '../../servicios/files-service.service';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';
import Chart, { registerables } from 'chart.js/auto';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import jsPDF from 'jspdf';
import { HoverBackgroundDirective } from '../../directives/hover-background.directive';
@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [NgxChartsModule, HoverBackgroundDirective],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.css'
})
export class GraficosComponent {
  turnos: any[] = [];

  @ViewChild('chart') chart!: ElementRef;

  constructor(private firebaseService: FirebaseService) {
    Chart.register(...registerables); // Registrando los módulos de Chart.js necesarios
  }

  ngOnInit(): void {
    this.firebaseService.getTurnos().subscribe((data: any[]) => {
      this.turnos = data;
      this.renderChart();
    });
  }

  renderChart(): void {
    const especialidades = this.turnos.map(turno => turno.especialidades).flat();
    const counts: { [key: string]: number } = {};

    especialidades.forEach(especialidad => {
      counts[especialidad] = (counts[especialidad] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    const ctx = this.chart.nativeElement.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Turnos por Especialidad',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  downloadAsPDF(): void {
    const chartElement = this.chart.nativeElement;

    // Obtener imagen base64 del gráfico
    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // Crear documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Agregar imagen del logo
      const logoImg = new Image();
      logoImg.src = 'assets/image.png'; // Ruta a la imagen del logo
      pdf.addImage(logoImg, 'PNG', 15, 15, 30, 30); // Agregar logo al PDF

      // Agregar título de Clinitech
      pdf.setFontSize(18);
      pdf.text('Clinitech', 50, 30); // Posición del texto del título

      // Agregar título del informe
      pdf.setFontSize(16);
      pdf.text('Informe de Cantidad de Turnos por Especialidad', 15, 60); // Posición del texto del título del informe

      // Agregar imagen base64 del gráfico
      pdf.addImage(imgData, 'PNG', 15, 70, pdfWidth - 30, pdfHeight);

      // Guardar PDF
      pdf.save('grafico.pdf');
    });
  }
}