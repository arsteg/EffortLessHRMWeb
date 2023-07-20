import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from 'src/app/_services/project.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { MatrixData } from '../model/timesheet';
import { Attendance } from 'src/app/reports/model/productivityModel';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-admin-timesheet',
  templateUrl: './admin-timesheet.component.html',
  styleUrls: ['./admin-timesheet.component.css']
})
export class AdminTimesheetComponent implements OnInit {
  timesheetForm: FormGroup;
  fromDate:string;
  toDate:string= this.datePipe.transform(new Date(),'yyyy-MM-dd');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  startDate: string;
  endDate: string;
  timeLogs: MatrixData;
  dateRange: Date[];
  timesheetTotals:any[]=[];
  timesheetAllTotals:any=[];
  projectList:any[]=[];
  selectedUser: string[] = [];
  members: any;
  member:any;
  @ViewChild('toDateRef') toDateRef: ElementRef;
  adminTimeSheets: any = [];
  selectAll: boolean = false;

  fromDateControl = new FormControl('', [
    Validators.required,
    this.dateValidator.bind(this),
  ]);

  toDateControl = new FormControl('', [
    Validators.required,
    this.dateValidator.bind(this),
  ]);


  constructor(private datePipe:DatePipe,private timeLogService:TimeLogService, private toast:ToastrService,
    private projectService:ProjectService, private fb: FormBuilder, private exportService: ExportService) { }


  ngOnInit(): void {
  this.getAllProjects();
  this.populateUsers();
  this.getFirstDayOfWeek();
  }

  onSubmit() {
  }

  populateTimesheet(){
    this.timesheetTotals=[];
    this.timesheetAllTotals={};
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const fromDt= this.formatDate(this.fromDate);
    const toDt= this.formatDate(this.toDate);
    if (this.selectedUser.length === 0) {
        this.timesheetTotals=[];
        this.timesheetAllTotals={};
        return;
    }
    this.timeLogService.geAdminTimeSheet(`${this.selectedUser.join()}`, fromDt,toDt ).toPromise()
    .then(response => {
      this.timeLogs = response.data;
      if(this.timeLogs.columns.length>0){
        this.timesheetTotals[this.timeLogs.columns.length-2]=0;
      }

      this.selectedUser.forEach(user=>{
        const logs = this.timeLogs?.matrix[user];
        this.timesheetTotals=[];
        this.timesheetTotals[this.timeLogs.columns.length-2]=0;
        for(let r=0 ;r< logs.length;r++){
          let rowTotal=0;
          for(let c=1;c<logs[r].length;c++){
            this.timesheetTotals[c-1] = (this.timesheetTotals[c-1] || 0 )  + (logs[r][c] || 0 );
            rowTotal= (+rowTotal)+ (logs[r][c] || 0 );
          }
          this.timesheetTotals[this.timesheetTotals.length-1]=rowTotal;
        }
        this.timesheetAllTotals[user]=this.timesheetTotals;
      });
    })
    .catch(error => {
      this.toast.error('Something went wrong, Please try again.', 'Error!');
    });
  }

  filterData(){
    // Remove 'all' from selectedUser array, if present
  if (this.selectedUser.includes('all')) {
    this.selectedUser.splice(this.selectedUser.indexOf('all'), 1);
  }
    this.populateTimesheet();
  }
  exportToExcel() {
    console.log(this.timesheetAllTotals)
this.exportService.exportToExcel('Admin Timesheet', 'adminTimeSheets', this.timesheetAllTotals);
}
  exportToCsv() {
    console.log(this.timesheetAllTotals)
    this.exportService.exportToCSV('Admin Timesheet', 'adminTimeSheets', this.timesheetAllTotals);
  }

  @ViewChild('adminTimeSheets') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('Admin Timesheet', this.content.nativeElement)
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

  getAllProjects() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.projectService.getprojects('', '').subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  getProjectName(id:string){
    return this.projectList.find(p=>p.id==id)?.projectName;
  }
  getUserName(id: string) {
    const user = this.members.find((p) => p.id === id);
    return user ? user.name.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '';
  
  }
  getFirstDayOfWeek(){
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
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

  populateUsers() {
    this.members = [];
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.email });
    this.member = this.currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any; }) => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email != this.currentUser.email) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
          },
          error: error => {
            console.log('There was an error!', error);
          }
        });
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }
  selectAllUsers() {
    if (!this.selectAll) {
      this.selectedUser = this.members.map(member => member.id);
    } else {
      this.selectedUser = [];
    }
    this.selectAll = !this.selectAll;
    this.filterData();
  }
  
  
}
