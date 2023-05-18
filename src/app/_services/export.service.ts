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

  exportToPdf(fileName:string, content: HTMLElement): void
  {
    
    let pdf = new jsPDF();
    html2canvas(content).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      pdf.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);

      pdf.save(fileName + ".pdf");
    });
  }
}