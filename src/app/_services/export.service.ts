import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
    providedIn: 'root'
  })
export class ExportService {
  constructor() { }

  exportToExcel(fileName:string, tableId: string, jsondata:any): void
  {
    /* pass here the table id */
    let element = document.getElementById(tableId);
    //const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const ws: XLSX.WorkSheet =XLSX.utils.json_to_sheet(jsondata);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    XLSX.writeFile(wb, fileName + ".xlsx");
  }

  exportToCSV(fileName:string, tableId: string, jsondata:any){
    /* pass here the table id */
    let element = document.getElementById(tableId);
    const ws: XLSX.WorkSheet =XLSX.utils.json_to_sheet(jsondata);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    XLSX.writeFile(wb, fileName + ".csv");
  }

  exportToPdf(fileName: string, title: string, content: HTMLElement): void {
    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, A4 size
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10; // Adjust margins
    const titleY = 15; // Position for the title

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // Fit width to A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 25;

      // Add Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, titleY, { align: 'center' });

      // Add Content
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // Handle multi-page PDFs
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      // Download
      pdf.save(`${fileName}.pdf`);
    }).catch((error) => {
      console.error("Error generating PDF:", error);
    });
  }

export(fileName: string, tableId: string, format: 'csv' | 'xls') {
  // Get the table element by ID
  const table = document.getElementById(tableId);

  if (!table) {
    console.error(`Table with ID '${tableId}' not found.`);
    return;
  }

  const dataToExport = [];
  const rows = table.querySelectorAll('tbody tr');

  // Iterate through table rows
  rows.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll('td');

    // Iterate through row cells
    cells.forEach((cell) => {
      rowData.push(cell.textContent.trim());
    });

    dataToExport.push(rowData);
  });

  // Generate the worksheet and workbook
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataToExport);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Save to file based on the selected format
  if (format === 'csv') {
    XLSX.writeFile(wb, fileName + '.csv');
  } else if (format === 'xls') {
    XLSX.writeFile(wb, fileName + '.xls');
  }
}


}
