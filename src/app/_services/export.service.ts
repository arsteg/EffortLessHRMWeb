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

  exportToPdf(fileName: string, title:string, content: HTMLElement): void {
    const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize jsPDF
    // Generate the content of the report
    html2canvas(content).then((canvas) => {
      const fileWidth = 208; // A4 width in mm
      const fileHeight = (canvas.height * fileWidth) / canvas.width; // Calculate proportional height
      const FILEURI = canvas.toDataURL('image/png');

      // Add the title to the PDF
      pdf.setFontSize(16); // Set font size for the title
      pdf.setFont('helvetica', 'bold'); // Use bold font
      pdf.text(title, pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' }); // Center title at y=15mm

      // Add the content below the title
      const contentPosition = 25; // Start content below the title (leave space for the title)
      pdf.addImage(FILEURI, 'PNG', 0, contentPosition, fileWidth, fileHeight);

      // Save the file
      pdf.save(fileName + ".pdf");
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
