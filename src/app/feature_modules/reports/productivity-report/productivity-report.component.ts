import { Component, OnInit } from '@angular/core';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Productivity } from '../model/productivityModel';
import { ReportsService } from '../../../_services/reports.service';
import { CommonService } from 'src/app/_services/common.Service';
import { UtilsService } from 'src/app/_services/utils.service';
import { PreferenceService } from 'src/app/_services/user-preference.service';
import { PreferenceKeys } from 'src/app/constants/preference-keys.constant';

@Component({
  selector: 'app-productivity-report',
  templateUrl: './productivity-report.component.html',
  styleUrls: ['./productivity-report.component.css']
})
export class ProductivityReportComponent implements OnInit {
  userId = [];
  projectId: string;
  members: any;
  member: any;
  fromDate: any;
  toDate: any;
  selectedUser: any = [];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  firstLetter: string;
  totalActiveTime: Number;
  productivity: any = [];
  showSingleMember: boolean = true;
  showAllMembers: boolean = true;
  public sortOrder: string = ''; // 'asc' or 'desc'
  activeButton: string = 'Members';


  constructor(
    private timeLogService: TimeLogService,
    private reportService: ReportsService,
    public commonservice: CommonService,
    private utilsService:UtilsService,
    private preferenceService: PreferenceService
  ) {
    this.fromDate = new Date().toISOString().slice(0, 10);
    this.toDate = new Date().toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    
    this.preferenceService.getPreferenceByKey(PreferenceKeys.ReportsProductivityReportsBy, this.currentUser?.id)
      .subscribe({
        next: (response: any) => {
          const preferences = response?.data?.preferences || [];
          const match = preferences.find((pref: any) =>
            pref?.preferenceOptionId?.preferenceKey === PreferenceKeys.ReportsProductivityReportsBy
          );
          const prefvalue = match?.preferenceOptionId?.preferenceValue || '';
          if (prefvalue === 'Single') {
            this.toggleSingleMember();
          } else if (prefvalue === 'Members') {
            this.toggleAllMembers();
          }
        },
        error: (err) => {
          console.error('Failed to load language preference', err);
          this.toggleSingleMember();
        }
      });
    this.populateUsers();
  }

  toggleSingleMember() {
    this.showSingleMember = true;
    this.showAllMembers = false;
    this.activeButton = 'Single';

    this.preferenceService.createOrUpdatePreference(
          this.currentUser.id,
          PreferenceKeys.ReportsProductivityReportsBy,
          'Single'
        ).subscribe({
          next: () => console.log(`Menu state updated to singe`),
          error: (err) => console.error('Error updating menu state:', err)
        });
  }
  toggleAllMembers() {
    this.showSingleMember = false;
    this.showAllMembers = true;
    this.activeButton = 'Members';

    this.preferenceService.createOrUpdatePreference(
          this.currentUser.id,
          PreferenceKeys.ReportsProductivityReportsBy,
          'Members'
        ).subscribe({
          next: () => console.log(`Menu state updated to members`),
          error: (err) => console.error('Error updating menu state:', err)
        });
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

  filterData() {
    this.getProductivityPerMem();
  }

  minutesToTime(input) {
    const minutes = Math.floor(Math.abs(input));
    const hours = Math.floor(minutes / 60);
    const seconds = minutes % 60;
    return hours + ' hr ' + minutes + ' m ' + seconds +' s';
  }


  convertToPercentage(total, consumed) {
    return Math.round((consumed * 100) / total);
  }

  averageCount(totalTime, totalCount) {
    return Math.round(totalCount / totalTime);
  }

  millisecondsToTime(milliseconds) {
    const ms = Math.floor(Math.abs(milliseconds));
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return hours + ' hr ' + minutes + ' m ' + seconds + ' s';
  }

  millisecondsToMinutes(milliseconds: number): number {
    return Math.round(milliseconds / 60000);
  }

  getProductivityPerMem() {
    let searchProductivity = new Productivity();
    searchProductivity.fromdate = this.utilsService.convertToUTC(this.convertToDateWithStartTime(this.fromDate));
    searchProductivity.todate = this.utilsService.convertToUTC(this.convertToDateWithEndTime(this.toDate));
    searchProductivity.users = (this.selectedUser.length==0) ? [this.currentUser.id] : this.selectedUser;
    this.reportService.getProductivity(searchProductivity).subscribe(result => {
      this.productivity = result.data;
    });
  }

  getProductivityAllMem() {
    let searchProductivity = new Productivity();
    searchProductivity.fromdate = this.utilsService.convertToUTC(this.convertToDateWithStartTime(this.fromDate));
    searchProductivity.todate = this.utilsService.convertToUTC(this.convertToDateWithEndTime(this.toDate));
    searchProductivity.users = [];
    this.reportService.getProductivity(searchProductivity).subscribe(result => {
      this.productivity = result.data;
    });
  }

  getProductiveProgressValue(productivity:any[]) {
    return productivity?.length ? this.convertToPercentage(productivity[0]?.total, productivity[0]?.timeSpentProductive) : 0;
  }

  getNonProductiveProgressValue(productivity:any[]) {
    return productivity?.length ? this.convertToPercentage(productivity[0]?.total, productivity[0]?.timeSpentNonProductive) : 0;
  }

  getActiveProgress(productivity:any[]) {
    return productivity?.length ? this.convertToPercentage(productivity[0]?.total, (productivity[0]?.TimeSpent)) : 0;
  }

  getProductiveProgressValueAllMember(data:any) {
    return this.convertToPercentage(data.total, data.timeSpentProductive);
  }

  getNonProductiveProgressValueAllMember(productivity) {
    return this.convertToPercentage(productivity.total, productivity.timeSpentNonProductive);
  }

  private convertToDateWithStartTime(dateString: string): Date {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  private convertToDateWithEndTime(dateString: string): Date {
    const date = new Date(dateString);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }

  selectedUsersChanged($event: string): void {
    this.selectedUser = $event;
    this.getProductivityPerMem();
  }
}
