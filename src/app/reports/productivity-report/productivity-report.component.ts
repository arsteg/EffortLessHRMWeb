import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Productivity } from '../model/productivityModel';
import { ReportsService } from '../../_services/reports.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-productivity-report',
  templateUrl: './productivity-report.component.html',
  styleUrls: ['./productivity-report.component.css']
})
export class ProductivityReportComponent implements OnInit {

  private _jsonURL = '.../../../assets/reportproductivity.json';
  userId: string;
  projectId: string;
  members: any;
  member: any;
  fromDate: any;
  toDate: any;
  currentDate: Date = new Date();
  diff: any = this.currentDate.getDate() - this.currentDate.getDay() + (this.currentDate.getDay() === 0 ? -6 : 1);
  lastday: any = this.currentDate.getDate() - (this.currentDate.getDay() - 1) + 6;
  selectedUser: any = [];
  roleName = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  firstLetter: string;
  totalActiveTime: Number;
  productivity: any = [];
  showSingleMember: boolean = true;
  showAllMembers: boolean = true;
  public sortOrder: string = ''; // 'asc' or 'desc'
  activeButton: string = 'Members';
  


  constructor(
    private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService,
    private reportService: ReportsService,
    public commonservice: CommonService
  ) {
    this.fromDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)), 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.populateUsers();
    this.getProductivity();
    this.toggleSingleMember();
  }

  toggleSingleMember() {
    this.showSingleMember = true;
    this.showAllMembers = false;
    this.activeButton = 'Single';
  }
  toggleAllMembers() {
    this.showSingleMember = false;
    this.showAllMembers = true;
    this.activeButton = 'Members';
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
    this.getProductivity();
  }

  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
  }


  convertToPercentage(total, consumed) {
    return ((consumed * 100) / total);
  }

  averageCount(totalTime, totalCount) {
    return Math.floor(totalCount / totalTime);
  }
  millisecondsToTime(milliseconds) {
    let hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    return hours + ' hr ' + minutes + ' m';
  }

  getProductivity() {
    let searchPrudctivity = new Productivity();
    searchPrudctivity.fromdate = new Date(this.fromDate);
    searchPrudctivity.todate = new Date(this.toDate);
    searchPrudctivity.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];
    this.reportService.getProductivity(searchPrudctivity).subscribe(result => {
      this.productivity = result.data;
    }
    )
  }
}
