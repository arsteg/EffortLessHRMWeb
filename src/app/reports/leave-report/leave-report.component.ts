import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common'; 
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-leave-report',
  templateUrl: './leave-report.component.html',
  styleUrls: ['./leave-report.component.css']
})
export class LeaveReportComponent implements OnInit {

  private _jsonURL = '.../../../assets/leavereport.json';
  userId: string;
  members: any;
  member: any;
  fromDate: any;
  toDate: any;
  totalDay:number=0;
  searchText ='';
  currentDate: Date = new Date();
  diff: any = this.currentDate.getDate() - this.currentDate.getDay() + (this.currentDate.getDay() === 0 ? -6 : 1);
  lastday: any = this.currentDate.getDate() - (this.currentDate.getDay() - 1) + 6;
  leaveList: any = [];
  p: number = 1;
  selectedUser: any = [];
  roleId = localStorage.getItem('roleId');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  public getJSON(): Observable<any> {
    return this.http.get(this._jsonURL);
  }

  constructor(
    private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    )
  {
    this.fromDate= this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)),'yyyy-MM-dd');  
    this.toDate=this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)),'yyyy-MM-dd');
    this.getLeaveData();
  }

  ngOnInit(): void {
    this.populateUsers();
  }

  populateUsers() {    
    this.members = [];
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.email });
    this.member = this.currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != this.currentUser.id) {
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

  filterData(){
    let users = (this.selectedUser === undefined || this.selectedUser.length==0) ? null : this.selectedUser;
    let fromDate = this.fromDate;
    let toDate = this.toDate;
  }

  getLeaveData(){
    this.getJSON().subscribe(data => {
      this.leaveList = data;
      this.totalDay = data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.total), 0);
     });
  }

  exportToExcel(){
    this.exportService.exportToExcel('Leave', 'leaveReport', this.leaveList);
  }
  exportToCsv(){
    this.exportService.exportToCSV('Leave', 'leaveReport', this.leaveList);
  }
  
  @ViewChild('leaveReport') content!: ElementRef
  exportToPdf(){
    this.exportService.exportToPdf('Leave', this.content.nativeElement)
  }

}
