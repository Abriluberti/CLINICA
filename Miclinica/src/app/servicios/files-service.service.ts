import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class FilesServiceService {
  public logoPath: string = "./../../../assets/image.png";

  constructor(private http: HttpClient) { }

  downloadPdfChart(title: string, filename: string, image: string) {
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    // Ajuste de dimensiones
    const imgWidth = 180; // Ancho de la imagen
    const imgHeight = 160; // Alto de la imagen
    doc.addImage(image, 'PNG', 10, 20, imgWidth, imgHeight);
    doc.save(filename + '.pdf');
  }
  public async downloadPDF(arrayInfo: any[]) {
    const pdf = new jsPDF();

    var fecha = "Reporte emitido el " + new Date().toLocaleDateString();
    var title = "Historias clínicas de " + arrayInfo[0].Paciente;

    // Obtener las dimensiones de la página
    const pageSize = pdf.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    const pageHeight = pageSize.getHeight();

    let logoBase64 = await this.convertImageToBase64(this.logoPath);

    const logoWidth = 100;
    const logoHeight = 100;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = (pageHeight - logoHeight) / 2;

    pdf.addImage(logoBase64, 'JPEG', logoX, logoY, logoWidth, logoHeight);

    pdf.setFontSize(25);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, pageWidth / 2, 50, { align: "center" });

    // Configurar fuente y tamaño para el texto de la fecha
    pdf.setFontSize(25);
    pdf.setFont("helvetica", "normal");
    pdf.text(fecha, pageWidth / 2, pageHeight - 30, { align: "center" });

    pdf.addPage();

    const clavesUnicas = new Set<string>();

    for (let i = 0; i < arrayInfo.length; i++) {
      const objeto = arrayInfo[i];

      for (const clave in objeto) {
        if (objeto.hasOwnProperty(clave)) {
          clavesUnicas.add(clave);
        }
      }
    }

    const columns = Array.from(clavesUnicas);
    let filas: any[] = [];

    for (var i = 0; i < arrayInfo.length; i++) {
      filas.push(Object.values(arrayInfo[i]));
    }

    autoTable(pdf, {
      columns: columns,
      body: filas,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    pdf.save(arrayInfo[0].Paciente + '_' + arrayInfo[0].Especialidad + '.pdf');
  }

  public async downloaddPDF(imageUrl: string) {
    const pdf = new jsPDF();

    // Agregar imagen al PDF
    const logoBase64 = await this.convertImageToBase64(this.logoPath);
    const logoWidth = 100;
    const logoHeight = 100;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = (pageHeight - logoHeight) / 2;
    pdf.addImage(logoBase64, 'JPEG', logoX, logoY, logoWidth, logoHeight);

    // Configurar título y fecha
    const fecha = new Date().toLocaleDateString();
    const title = "Reporte";

    pdf.setFontSize(25);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, pageWidth / 2, 50, { align: "center" });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text("Generado el: " + fecha, pageWidth / 2, pageHeight - 30, { align: "center" });

    // Agregar imagen capturada al PDF
    const imgWidth = 180; // Ancho de la imagen en el PDF
    const imgHeight = (imgWidth * 3) / 4; // Ajuste de altura proporcional
    pdf.addImage(imageUrl, 'PNG', (pageWidth - imgWidth) / 2, 100, imgWidth, imgHeight);

    pdf.save('reporte.pdf');
  }
  convertImageToBase64(imagen: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(imagen, { responseType: 'blob' }).subscribe((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data as string);
        };
        reader.onerror = () => {
          reject('Error al leer la imagen');
        };
        reader.readAsDataURL(blob);
      }, reject);
    });
  }
}