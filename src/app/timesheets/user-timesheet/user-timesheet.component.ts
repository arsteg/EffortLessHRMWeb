import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ToastrService } from 'ngx-toastr';
import { MatrixData } from '../model/timesheet';
import { ProjectService } from 'src/app/_services/project.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


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


  fromDateControl = new FormControl('', [
    Validators.required,
    this.dateValidator.bind(this),
  ]);

  toDateControl = new FormControl('', [
    Validators.required,
    this.dateValidator.bind(this),
  ]);



  constructor(private datePipe:DatePipe,private timeLogService:TimeLogService, private toast:ToastrService,
    private projectService:ProjectService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getFirstDayOfWeek();
    this.populateTimesheet();
    this.getProjectsByUser();

    this.timesheetForm = this.fb.group({
      fromDate: [this.fromDate, [Validators.required]],
      toDate: [this.toDate, [Validators.required]]
    }, {validator: this.dateRangeValidator});

  }
a
   onSubmit() {
  }

  populateTimesheet(){
    this.timesheetTotals=[];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const fromDt= this.formatDate(this.fromDate);
    const toDt= this.formatDate(this.toDate);
    this.timeLogService.getUserTimeSheet(currentUser.id, fromDt,toDt ).toPromise()
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
  exportToCsv(){
  }
  exportToExcel(){

  }

  exportToPdf(){

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
    return this.projectList.find(p=>p.id==id).projectName;
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
