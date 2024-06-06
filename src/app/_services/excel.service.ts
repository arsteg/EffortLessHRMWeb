import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  generateAttendanceFormat(data: any[], fileName: string, dropdownOptions:any, dropdownColumnName:string , sheetName:string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = this.attendanceRecordColumnDefinitions();

    // Add the data rows
    data.forEach(d => {
      worksheet.addRow(d);
    });

    this.formatHeaderRow(worksheet);

    worksheet.getColumn(dropdownColumnName).eachCell((cell, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: dropdownOptions,
          showErrorMessage: true,
          errorTitle: 'Invalid Input',
          error: 'Please select a valid city from the dropdown.'
        };
      }
    });
    // Save the workbook to a blob
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    });
  }

  attendanceRecordColumnDefinitions():Partial<ExcelJS.Column>[] {
    return [
      { header: 'Sl. No.', key: 'SlNo', width: 7 },
      { header: 'Date(dd-mm-yyyy)', key: 'Date', width: 20 },
      { header: 'Employee Code', key: 'EmployeeCode', width: 14 },
      { header: 'Check in date', key: 'CheckInDate', width: 15 },
      { header: 'Check out date', key: 'CheckOutDate', width: 15 },
      { header: 'In Time (hh:mm:ss)', key: 'InTime', width: 20 },
      { header: 'Out Time (hh:mm:ss)', key: 'OutTime', width: 20 },
      { header: 'Employee Shift', key: 'Employee Shift', width: 15 }
    ];
  }

  formatHeaderRow(worksheet: ExcelJS.Worksheet): void {
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Bold font and white color
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000FF' } // Background color blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment
    });
    headerRow.height = 40; // Set header row height
  }

}
