import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common'; 
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { productivityModel } from '../model/productivityModel';

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
  roleId = localStorage.getItem('roleId');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  firstLetter: string;
  productivityModel: productivityModel;
  totalActiveTime: Number;
  
  public getJSON(): Observable<productivityModel> {
    var response = this.http.get<productivityModel>(this._jsonURL);
    return response;
    //return this.http.get(this._jsonURL);
  }

  constructor(
    private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
  )
  {
    this.fromDate= this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)),'yyyy-MM-dd');  
    this.toDate=this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)),'yyyy-MM-dd');
    this.getJSON().subscribe((response: productivityModel) => {
      this.productivityModel = response;
      this.totalActiveTime = Number(response.totalTimeTracked) - Number(response.totalIdleTime);
    })
    //this.productivityModel = this.getJSON();
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

  millisecondsToMinutes(milliseconds) {
    let hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    return (hours *60) +  Math.floor((milliseconds / (1000 * 60)) % 60);
  }

  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
  }
  millisecondsToTime(milliseconds) {
    let hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    return hours + ' hr ' + minutes + ' m';
  }

  convertToPercentage(total, consumed){
    return ((consumed*100)/total);
  }

  averageCount(totalTime, totalCount){
    return Math.floor(totalCount/totalTime);
  }

  // calculateActiveTime(totalTime, totalIdleTime){
  //   return this.minutesToTime(Number(this.millisecondsToMinutes(totalTime)) - Number(this.millisecondsToMinutes(totalIdleTime)));
  // }

  getRandomColor(lastName: string) {
    let colorMap = {
      A: '#556def',
      B: '#faba5c',
      C: '#0000ff',
      D: '#ffff00',
      E: '#00ffff',
      F: '#ff00ff',
      G: '#f1421d',
      H: '#1633eb',
      I: '#f1836c',
      J: '#824b40',
      K: '#256178',
      L: '#0d3e50',
      M: '#3c8dad',
      N: '#67a441',
      O: '#dc57c3',
      P: '#673a05',
      Q: '#ec8305',
      R: '#00a19d',
      S: '#2ee8e8',
      T: '#5c9191',
      U: '#436a2b',
      V: '#dd573b',
      W: '#424253',
      X: '#74788d',
      Y: '#16cf96',
      Z: '#4916cf'
    };
    this.firstLetter= lastName.charAt(0).toUpperCase();
    return colorMap[this.firstLetter] || '#000000';
  }
}
