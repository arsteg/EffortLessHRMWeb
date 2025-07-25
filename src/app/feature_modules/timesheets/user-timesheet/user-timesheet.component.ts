import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ToastrService } from 'ngx-toastr';
import { MatrixData } from '../model/timesheet';
import { ProjectService } from 'src/app/_services/project.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExportService } from 'src/app/_services/export.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';


@Component({
  selector: 'app-user-timesheet',
  templateUrl: './user-timesheet.component.html',
  styleUrls: ['./user-timesheet.component.css']
})
export class UserTimesheetComponent implements OnInit {
  timesheetForm: FormGroup;
  fromDate:string;
  toDate:string= this.datePipe.transform(new Date(),'yyyy-MM-dd');
  userId: string;
  startDate: string;
  endDate: string;
  timeLogs: MatrixData;
  dateRange: Date[];
  timesheetTotals:any[]=[];
  projectList:any[]=[];
  @ViewChild('toDateRef') toDateRef: ElementRef;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  fromDateControl = new FormControl('', [
    Validators.required,
    this.dateValidator.bind(this),
  ]);

  toDateControl = new FormControl('', [
    Validators.required,
    this.dateValidator.bind(this),
  ]);



  constructor(private datePipe:DatePipe,private timeLogService:TimeLogService, private toast:ToastrService,
    private projectService:ProjectService, private fb: FormBuilder, private exportService: ExportService,
  private auth: AuthenticationService) { }

  ngOnInit(): void {
    this.getFirstDayOfWeek();
    this.populateTimesheet();
    this.getProjectsByUser();

    this.timesheetForm = this.fb.group({
      fromDate: [this.fromDate, [Validators.required]],
      toDate: [this.toDate, [Validators.required]]
    }, {validator: this.dateRangeValidator});

  }

   onSubmit() {
  }

  populateTimesheet(){
    this.timesheetTotals=[];
    const fromDt= this.formatDate(this.fromDate);
    const toDt= this.formatDate(this.toDate);
    this.timeLogService.getUserTimeSheet(this.currentUser.id, fromDt,toDt ).toPromise()
    .then(response => {
      this.timeLogs = response.data;
      if(this.timeLogs.matrix.length>0){
        this.timesheetTotals[this.timeLogs.matrix.length]=0;
      }
      this.timeLogs?.matrix.forEach(row=>{
        let rowTotal=0;
        for(let i=1;i<row.length;i++){
          this.timesheetTotals[i] = (this.timesheetTotals[i]||0)+row[i];
        }
      })
    })
    .catch(error => {
      this.toast.error('Something went wrong, Please try again.', 'Error!');
    });
  }

  filterData(){
    this.populateTimesheet();
  }

  exportToCsv() {
    this.generateTableContent('csv').then(csvContent => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'user_timesheet.csv');
    });
  }
  // getSelectedUserNames(){
  //   const user = this.currentUser.id;
  //   this.auth.GetMe(user).subscribe((res: any)=>{
  //     const response = res.data.users;
  //     console.log(`${response.firstName+' '+ response.lastName}`)
  //     return `${response.firstName+' '+ response.lastName}`
  //   })
  // }

getSelectedUserNames(): Promise<string> {
  const user = this.currentUser.id;
  return new Promise((resolve, reject) => {
    this.auth.GetMe(user).subscribe((res: any) => {
      const response = res.data.users;
      console.log(`${response.firstName} ${response.lastName}`);
      resolve(`${response.firstName} ${response.lastName}`);
    }, (error) => {
      reject(error);
    });
  });
}
  async generateTableContent(format: 'csv' | 'xls'): Promise<any> {
    const tableId = 'userTimeSheet';
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`Table with ID '${tableId}' not found.`);
      return;
    }
    let content: any = [];
    content.push([`From Date: ${this.fromDate || ''}`]);
    content.push([`To Date: ${this.toDate || ''}`]);
    const userName = await this.getSelectedUserNames();
    content.push([`User: ${userName}`]);
    content.push([]);
    const headers = table.querySelectorAll('thead tr th');
    const headerArray = Array.from(headers).map(header => header.textContent?.trim() || '');
    content.push(headerArray);
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const cellArray = Array.from(cells).map(cell => cell.textContent?.trim() || '');
      content.push(cellArray);
    });

    if (format === 'csv') {
      return content.map(row => row.join(',')).join('\n');
    } else if (format === 'xls') {
      return content;
    }
  }

  async exportToXlsx() {
    const xlsxContent = await this.generateTableContent('xls');
    const worksheet = XLSX.utils.aoa_to_sheet(xlsxContent);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const xlsxBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const xlsxFile = new Blob([xlsxBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(xlsxFile, 'user_TimeSheet.xlsx');
  }

  @ViewChild('userTimeSheet') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('user Timesheet', 'User Timesheet Report', this.content.nativeElement)
  }
  formatDate(dateVal) {
    var newDate = new Date(dateVal);
    var sMonth = this.padValue(newDate.getMonth() + 1);
    var sDay = this.padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    return sYear + "-" + sMonth + "-" + sDay + "T00:00:00.000+00:00";
  }
  padValue(value) {
    return (value < 10) ? "0" + value : value;
  }

  getTimeSpentOnDate(row: any[], date: Date): string {

    const filteredEntries = row.filter(entry => entry.date === date.toISOString().slice(0, 10));
    if (filteredEntries.length === 0) {
      return '-';
    }
    const totalSeconds = filteredEntries.reduce((acc, cur) => acc + Math.round((new Date(cur.endTime).getTime() - new Date(cur.startTime).getTime()) / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  getTotalHours(hours){
    return hours.reduce((acc, val) => (+acc) + (+val), 0);
  }

  getProjectsByUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.projectService.getProjectByUserId(currentUser.id).subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  getProjectName(id:string){
    return this.projectList.find(p=>p.id==id)?.projectName;
  }

  getFirstDayOfWeek(){
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const firstDayOfWeek = new Date(today.setDate(diff));
    this.fromDate = this.datePipe.transform(firstDayOfWeek, 'yyyy-MM-dd');
  }

  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const date = new Date(value);
    const today = new Date();

    if (date > today) {
      return { futureDate: true };
    }

    const fromDate = this.fromDateControl.value;
    const toDate = this.toDateControl.value;

    if (fromDate && toDate) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        return { invalidRange: true };
      }
    }

    return null;
  }

  dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const fromDate = control.get('fromDate').value;
    const toDate = control.get('toDate').value;
    const today = new Date().toISOString().slice(0, 10);

    if (fromDate > toDate) {
      return { 'invalidRange': true };
    }
    if (fromDate > today || toDate > today) {
      return { 'futureDate': true };
    }
    return null;
  }
}
