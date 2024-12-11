import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ExportService } from 'src/app/_services/export.service';
import { ReportsService } from '../../../_services/reports.service';
import { Leave } from '../model/productivityModel';

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
  totalDay: number = 0;
  searchText = '';
  currentDate: Date = new Date();
  diff: any = this.currentDate.getDate() - this.currentDate.getDay() + (this.currentDate.getDay() === 0 ? -6 : 1);
  lastday: any = this.currentDate.getDate() - (this.currentDate.getDay() - 1) + 6;
  leaveList: any = [];
  p: number = 1;
  selectedUser: any = [];
  roleName = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  totalHours: number = 0;

  public getJSON(): Observable<any> {
    return this.http.get(this._jsonURL);
  }

  constructor(
    private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
    , private exportService: ExportService,
    private reportService: ReportsService
  ) {
    this.fromDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)), 'yyyy-MM-dd');
    this.getLeaveReport();
  }

  ngOnInit(): void {
    this.populateUsers();
    this.getLeaveReport()
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

  filterData() {
    let users = (this.selectedUser === undefined || this.selectedUser.length == 0) ? null : this.selectedUser;
    let fromDate = this.fromDate;
    let toDate = this.toDate;
  }

  exportToExcel() {
    this.exportService.exportToExcel('Leave', 'leaveReport', this.leaveList);
  }
  exportToCsv() {
    this.exportService.exportToCSV('Leave', 'leaveReport', this.leaveList);
  }

  @ViewChild('leaveReport') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('Leave',  'Leave Report', this.content.nativeElement)
  }

  getLeaveReport() {
    // let searchLeave = new Leave();
    // searchLeave.fromdate = new Date(this.fromDate);
    // searchLeave.todate = new Date(this.toDate);

    // searchLeave.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];
    // this.reportService.getLeave(searchLeave).subscribe(result => {
    //   this.leaveList = result.data;
    // }
    // )
  }

}
