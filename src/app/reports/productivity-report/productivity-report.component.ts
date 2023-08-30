import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable, switchMap } from 'rxjs';
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
  userId = [];
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
  currentProfile: any;
  firstLetter: string;
  totalActiveTime: Number;
  productivity: any = [];
  showSingleMember: boolean = true;
  showAllMembers: boolean = true;
  public sortOrder: string = ''; // 'asc' or 'desc'
  activeButton: string = 'Members';
  role: any;


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
    this.toggleSingleMember();

//================= added temporary=======
    //this.commonservice.getCurrentUserRole().subscribe((role: any) => {   // comment temporary
      this.role = "admin"; // added temporary
    //})
//=========================


    this.getCurrentUser().subscribe(() => {
      this.initializeDefaultUser();
      this.populateUsers();
      if (this.showSingleMember && !this.showAllMembers) {
        this.getProductivityPerMem();
      }
      else{
        this.getProductivityAllMem();
      }
    });
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
  initializeDefaultUser() {
    if ((this.role.toLowerCase() === "admin" || null) || this.members.some(member => member.id === this.currentProfile.id)) {
      this.selectedUser = this.currentProfile.id;
    } else if (!this.selectedUser && this.members.length > 0) {
      this.selectedUser = this.members[0].id;
    }
  }

  populateUsers() {
    this.members = [];
    this.members.push({ id: this.currentProfile.id, name: "Me", email: this.currentProfile.email });
    this.member = this.currentProfile;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any; }) => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email != this.currentProfile.email) {
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
    this.getProductivityPerMem();
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

  millisecondsToMinutes(milliseconds: number): number {
    return milliseconds / 60000;
  }

  getProductivityPerMem() {
    let searchProductivity = new Productivity();
    searchProductivity.fromdate = new Date(this.fromDate);
    searchProductivity.todate = new Date(this.toDate);
    searchProductivity.users = (this.role.toLowerCase() === "admin" || null) ? this.selectedUser : [];
    this.reportService.getProductivity(searchProductivity).subscribe(result => {
      this.productivity = result.data;
    });
  }

  getProductivityAllMem() {
    let searchProductivity = new Productivity();
    searchProductivity.fromdate = new Date(this.fromDate);
    searchProductivity.todate = new Date(this.toDate);
    searchProductivity.users = this.currentProfile.id
    searchProductivity.fromdate = new Date(this.fromDate);
    searchProductivity.todate = new Date(this.toDate);
    searchProductivity.users = [];
    this.reportService.getProductivity(searchProductivity).subscribe(result => {
      this.productivity = result.data;
    });
  }

  getCurrentUser() {
    return this.commonservice.getCurrentUser().pipe(
      switchMap((profile: any) => {
        this.currentProfile = profile;
        return new Observable((observer) => {
          observer.next();
          observer.complete();
        });
      })
    );
  }
}
