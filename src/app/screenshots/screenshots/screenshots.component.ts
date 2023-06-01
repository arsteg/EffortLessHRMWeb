import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators, FormArray } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { TimeLogService } from 'src/app/_services/timeLogService';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { timeLog, screenshotRow, screenShotCell, ActivityLevel } from 'src/app/models/timeLog';
import { DatePipe } from '@angular/common';
import * as moment from 'moment'; // import moment.
import { AnimationDurations } from '@angular/material/core';
import { Observable, Subscription } from 'rxjs';
// import { threadId } from 'worker_threads';

interface teamMember {
  id: string;
  name: string;
  email: string
}

@Component({
  selector: 'app-screenshots',
  templateUrl: './screenshots.component.html',
  styleUrls: ['./screenshots.component.css']
})
export class ScreenshotsComponent implements OnInit {
  readonly defaultScreenshot: string = "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";
  imageBasepath = "data:image/jpg;base64,";
  selectedScreenShot = "";
  screenshotRows: screenshotRow[] = [];
  resetToken: null;
  selectedDate: any = this.datePipe.transform(new Date(), "yyyy-MM-dd");
  totalHours: number = 0;
  totalMinutes: number = 0;
  currentWeekTotalHours: number = 0;
  currentWeekTotalMinutes: number = 0;
  currentMonthTotalHours: number = 0;
  currentMonthTotalMinutes: number = 0;
  imagePath: string = "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";
  manualTimeImg: string = "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"
  members: teamMember[];
  member: any;
  currentTargetLabel: string = "";
  message: any;
  subscription: Subscription;
  selectedTimelog: any = [];
  logs = [];
  selectAllChecked: false;

  constructor(
    private timeLogService: TimeLogService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private fb: FormBuilder) {
    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
    });
  }

  ngOnInit(): void {
    this.members = [];
    this.populateMembers();
    this.showScreenShots();
    this.subscription = this.timeLogService.currentMessage.subscribe((message: any) => this.message = message);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
    this.showScreenShots();
  }

  populateMembers() {
    this.members = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.members.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.member = currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != currentUser.id) {
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
  // showScreenShots() {
   
  //   let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  //   let formattedDate = this.formatDate(this.selectedDate);
  //   var result = this.timeLogService.getLogsWithImages(this.member.id, formattedDate);
  //   result.subscribe({
  //     next: data => {
  //       this.screenshotRows = [];
  //       this.selectedTimelog = [];
  //       this.populateScreenShots(data.data);
  //     },
  //     error: error => {
  //       console.log('There was an error!', error);
  //     }
  //   })
  //   const startDate = this.getMonday(new Date());
  //   const endDate = new Date();


  //   this.timeLogService.getCurrentWeekTotalTime(this.member.id, this.formatDate(startDate), this.formatDate(endDate)).subscribe({
  //     next: data => {
  //       let totalMinutes = data.data.length * 10;
  //       this.currentWeekTotalHours = Math.floor(totalMinutes / 60);
  //       this.currentWeekTotalMinutes = totalMinutes % 60;

  //     },
  //     error: error => {
  //       console.log('There was an error!', error);
  //     }
  //   });

  //   const date = new Date();
  //   const firstday = new Date(date.getFullYear(), date.getMonth(), 1);
  //   const lastday = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  //   this.timeLogService.getCurrentWeekTotalTime(this.member.id, this.formatDate1(firstday), this.formatDate1(lastday)).subscribe({
  //     next: data => {
  //       let totalMinutes = data.data.length * 10;

  //       this.currentMonthTotalHours = Math.floor(totalMinutes / 60);
  //       this.currentMonthTotalMinutes = (totalMinutes % 60);
  //     },
  //     error: error => {
  //       console.log('There was an error!', error);
  //     }
  //   });

  // }
  showScreenShots() {
    debugger;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let formattedDate = this.formatDate(this.selectedDate);
    var result = this.timeLogService.getLogsWithImages(this.member.id, formattedDate);
    result.subscribe({
      next: data => {
        this.screenshotRows = [];
        this.selectedTimelog = [];
        this.populateScreenShots(data.data);
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  
    const startDate = this.getMonday(new Date());
    const endDate = new Date();
  
    this.timeLogService.getCurrentWeekTotalTime(this.member.id, this.formatDate(startDate), this.formatDate(endDate)).subscribe({
      next: data => {
        let totalMinutes = data.data.length * 10;
        this.currentWeekTotalHours = Math.floor(totalMinutes / 60);
        this.currentWeekTotalMinutes = totalMinutes % 60;
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  
    const date = new Date();
    const firstday = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastday = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
    this.timeLogService.getCurrentWeekTotalTime(this.member.id, this.formatDate1(firstday), this.formatDate1(lastday)).subscribe({
      next: data => {
        let totalMinutes = data.data.length * 10;
  
        this.currentMonthTotalHours = Math.floor(totalMinutes / 60);
        this.currentMonthTotalMinutes = (totalMinutes % 60);
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  
   
    setTimeout(() => {
      this.showScreenShots();
    }, 60000);
  }
  

  deleteScreenShot() {
    let logs = { logs: this.selectedTimelog.map((id) => { return { logId: id } }) };
    this.timeLogService.deletetimelog(logs)
      .subscribe(response => {
        this.selectedTimelog = [];
        this.showScreenShots();
      })
  }

  isRowSelected(event, id, index: number) {
    this.screenshotRows[index]['isRowSelected'] =
      (this.screenshotRows[index].col1['isSelected'] || (!this.screenshotRows[index].col1['isSelected'] && !this.screenshotRows[index].col1.url)) &&
      (this.screenshotRows[index].col2['isSelected'] || (!this.screenshotRows[index].col2['isSelected'] && !this.screenshotRows[index].col2.url)) &&
      (this.screenshotRows[index].col3['isSelected'] || (!this.screenshotRows[index].col3['isSelected'] && !this.screenshotRows[index].col3.url)) &&
      (this.screenshotRows[index].col4['isSelected'] || (!this.screenshotRows[index].col4['isSelected'] && !this.screenshotRows[index].col4.url)) &&
      (this.screenshotRows[index].col5['isSelected'] || (!this.screenshotRows[index].col5['isSelected'] && !this.screenshotRows[index].col5.url)) &&
      (this.screenshotRows[index].col6['isSelected'] || (!this.screenshotRows[index].col6['isSelected'] && !this.screenshotRows[index].col6.url));
    if (event.target.checked) {
      this.selectedTimelog.push(id);
    } else {
      let index = this.selectedTimelog.indexOf(id)
      if (index > -1) {
        this.selectedTimelog.splice(index, 1);
      }
    }
  }

  selectAll(event, index) {
    this.screenshotRows[index].col1['isSelected'] = this.screenshotRows[index]['isRowSelected'];
    this.screenshotRows[index].col2['isSelected'] = this.screenshotRows[index]['isRowSelected'];
    this.screenshotRows[index].col3['isSelected'] = this.screenshotRows[index]['isRowSelected'];
    this.screenshotRows[index].col4['isSelected'] = this.screenshotRows[index]['isRowSelected'];
    this.screenshotRows[index].col5['isSelected'] = this.screenshotRows[index]['isRowSelected'];
    this.screenshotRows[index].col6['isSelected'] = this.screenshotRows[index]['isRowSelected'];
    if (this.screenshotRows[index]['isRowSelected']) {
      if (this.screenshotRows[index].col1.url) {
        this.selectedTimelog.push(this.screenshotRows[index].col1._id);
      }
      if (this.screenshotRows[index].col2.url) {
        this.selectedTimelog.push(this.screenshotRows[index].col2._id);
      }
      if (this.screenshotRows[index].col3.url) {
        this.selectedTimelog.push(this.screenshotRows[index].col3._id);
      }
      if (this.screenshotRows[index].col4.url) {
        this.selectedTimelog.push(this.screenshotRows[index].col4._id);
      }
      if (this.screenshotRows[index].col5.url) {
        this.selectedTimelog.push(this.screenshotRows[index].col5._id);
      }
      if (this.screenshotRows[index].col6.url) {
        this.selectedTimelog.push(this.screenshotRows[index].col6._id);
      }
    }
    else {
      let elementsToDelete = [];
      this.selectedTimelog.forEach((timelogId: any, i: number) => {
        if (this.screenshotRows[index].col1._id == timelogId) { elementsToDelete.push(timelogId) }
        if (this.screenshotRows[index].col2._id == timelogId) { elementsToDelete.push(timelogId) }
        if (this.screenshotRows[index].col3._id == timelogId) { elementsToDelete.push(timelogId) }
        if (this.screenshotRows[index].col4._id == timelogId) { elementsToDelete.push(timelogId) }
        if (this.screenshotRows[index].col5._id == timelogId) { elementsToDelete.push(timelogId) }
        if (this.screenshotRows[index].col6._id == timelogId) { elementsToDelete.push(timelogId) }
      });
      this.selectedTimelog = this.selectedTimelog.filter(x => !elementsToDelete.includes(x) ? x : '');
    }
  }

  populateScreenShots(timeLogs: timeLog[]) {
    let startRowFlag = false;
    let countRowstoPop = 0;
    let totalTime = 0;
    for (let r = 0; r < 24; r++) {
      let row = new screenshotRow();
      for (let c = 0; c < 6; c++) {
        var cellDetail = this.geCellDetails(r, c, timeLogs);
        if (cellDetail != null) {
          if (cellDetail.isManualTime == true) {
            totalTime += 10; // Add 10 minutes for each manual time
          }
          else {
            totalTime += 10; // Add 1 minute for each regular time
          }
          countRowstoPop = 0;
          startRowFlag = true;
          if (c == 0) {
            row.col1 = cellDetail;
          }
          else if (c == 1) {
            row.col2 = cellDetail;
          }
          else if (c == 2) {
            row.col3 = cellDetail;
          }
          else if (c == 3) {
            row.col4 = cellDetail;
          }
          else if (c == 4) {
            row.col5 = cellDetail;
          }
          else if (c == 5) {
            row.col6 = cellDetail;
          }
        }
      }
      let hasData = row.hasData();
      if (hasData) {
        countRowstoPop = 0;
      }
      else {
        countRowstoPop++;
      }
      if (startRowFlag || row.hasData()) {
        row['isRowSelected'] = false;
        this.screenshotRows.push(this.attachTimelabel(r, row));
      }
    }
    for (let i = 0; i < countRowstoPop; i++) {
      this.screenshotRows.pop();
    }

    this.totalHours = Math.floor(totalTime / 60);
    this.totalMinutes = totalTime % 60;
  }

  attachTimelabel(rowNum: number, row: screenshotRow) {
    let h = this.padValue(rowNum);
    if (!row.col1) { row.col1 = new screenShotCell(`${h}:00`, null, null, null, null, null, null, null, null, null) }
    if (!row.col2) { row.col2 = new screenShotCell(`${h}:10`, null, null, null, null, null, null, null, null, null) }
    if (!row.col3) { row.col3 = new screenShotCell(`${h}:20`, null, null, null, null, null, null, null, null, null) }
    if (!row.col4) { row.col4 = new screenShotCell(`${h}:30`, null, null, null, null, null, null, null, null, null) }
    if (!row.col5) { row.col5 = new screenShotCell(`${h}:40`, null, null, null, null, null, null, null, null, null) }
    if (!row.col6) { row.col6 = new screenShotCell(`${h}:50`, null, null, null, null, null, null, null, null, null) }
    return row;
  }

  setSelectedScreenshot(event: any) {
    this.selectedScreenShot = event.currentTarget.src;
    this.currentTargetLabel = event.currentTarget.nextSibling.innerText;
  }

  SetPreviousDay() {
    this.selectedDate = this.datePipe.transform(this.addDays(this.selectedDate, -1), "yyyy-MM-dd");
    this.showScreenShots();
  }

  SetNextDay() {
    this.selectedDate = this.datePipe.transform(this.addDays(this.selectedDate, 1), "yyyy-MM-dd");
    this.showScreenShots();
  }

  DisableNext(): boolean {
    return this.selectedDate == this.datePipe.transform(new Date(), "yyyy-MM-dd");
  }
  addDays(date: Date, days: number): Date {
    let m = moment(this.selectedDate);
    date = m.add(days, 'days').toDate();
    return date;
  }
  formatDate(dateVal) {
    var newDate = new Date(dateVal);
    var sMonth = this.padValue(newDate.getMonth() + 1);
    var sDay = this.padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    return sYear + "-" + sMonth + "-" + sDay + "T00:00:00.000+00:00";
  }
  formatDate1(dateVal) {
    var newDate = new Date(dateVal);
    var sMonth = this.padValue(newDate.getMonth() + 1);
    var sDay = this.padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    return sYear + "-" + sMonth + "-" + sDay + "T00:00:00.000";
  }

  padValue(value) {
    return (value < 10) ? "0" + value : value;
  }

  getActivityColor(activityLevel: ActivityLevel) {
    return activityLevel == ActivityLevel.low ? 'red' : activityLevel == ActivityLevel.medium ? '#F4C430' : activityLevel == ActivityLevel.high ? 'green' : 'black';
  }

  geCellDetails(r: number, c: number, timeLogs: timeLog[]) {
    let result: screenShotCell = null;
    if (timeLogs && timeLogs.length > 0) {
      for (let i = 0; i < timeLogs.length; i++) {
        let fileName = this.GetFileNameWithoutExtension(timeLogs[i].filePath);
        let hh: number;
        let mm: number;
        if (timeLogs[i].isManualTime) {
          let endTime = new Date(timeLogs[i].endTime);
          let localEndTime = new Date(endTime.toLocaleString());
          hh = localEndTime.getHours();
          mm = localEndTime.getMinutes();
        } else {

          hh = +fileName.split('-')[0];
          mm = +fileName.split('-')[1];
          let localTime = new Date();
          localTime.setUTCHours(hh);
          localTime.setUTCMinutes(mm);
          hh = localTime.getHours();
          mm = localTime.getMinutes();
        }
        if (hh == r && mm <= (c * 10 + 9) && mm >= (c * 10)) {
          mm = this.padValue(mm - (mm % 10));
          if (timeLogs[i].isManualTime) {
            result = new screenShotCell(`${hh}:${mm}`, '', 0, 0, 0, '', '', true, false, true);
            console.log(result);
          } else {
            result = new screenShotCell(`${hh}:${mm}`, timeLogs[i].fileString, timeLogs[i].clicks, timeLogs[i].keysPressed, timeLogs[i].scrolls, timeLogs[i].url, timeLogs[i]._id, false, false, true);
          }
        }
      }
    }
    return result;
  }

  GetFileNameWithoutExtension(fileName) {
    return fileName.substr(fileName.length - 9).substr(0, 5);
  }

  getMonday(dt) {
    dt = new Date(dt);
    var day = dt.getDay(),
      diff = dt.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(dt.setDate(diff));
  }

  SetPreviousScreen() {
    for (let i = this.screenshotRows.length - 1; i >= 0; i--) {
      if (this.screenshotRows[i].col1.timeLabel == this.currentTargetLabel) {
        if (i >= 1) {
          if (this.screenshotRows[i - 1].col6.url != null) {
            this.currentTargetLabel = this.screenshotRows[i - 1].col6.timeLabel;
            this.selectedScreenShot = `${this.screenshotRows[i - 1].col6.url}`;
            return;
          }
          else {
            this.currentTargetLabel = this.screenshotRows[i - 1].col6.timeLabel;
          }
        }
      }
      if (this.screenshotRows[i].col2.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col1.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col1.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col1.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col1.timeLabel;
        }
      }
      if (this.screenshotRows[i].col3.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col2.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col2.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col2.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col2.timeLabel;
        }
      }
      if (this.screenshotRows[i].col4.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col3.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col3.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col3.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col3.timeLabel;
        }
      }
      if (this.screenshotRows[i].col5.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col4.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col4.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col4.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col4.timeLabel;
        }
      }
      if (this.screenshotRows[i].col6.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col5.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col5.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col5.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col5.timeLabel;
        }
      }
    }
  }

  SetNextScreen() {
    for (let i = 0; i < this.screenshotRows.length; i++) {
      if (this.screenshotRows[i].col1.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col2.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col2.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col2.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col2.timeLabel;
        }
      }
      if (this.screenshotRows[i].col2.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col3.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col3.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col3.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col3.timeLabel;
        }
      }
      if (this.screenshotRows[i].col3.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col4.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col4.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col4.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col4.timeLabel;
        }
      }
      if (this.screenshotRows[i].col4.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col5.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col5.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col5.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col5.timeLabel;
        }
      }
      if (this.screenshotRows[i].col5.timeLabel == this.currentTargetLabel) {
        if (this.screenshotRows[i].col6.url != null) {
          this.currentTargetLabel = this.screenshotRows[i].col6.timeLabel;
          this.selectedScreenShot = `${this.screenshotRows[i].col6.url}`;
          return;
        }
        else {
          this.currentTargetLabel = this.screenshotRows[i].col6.timeLabel;
        }
      }
      if (this.screenshotRows[i].col6.timeLabel == this.currentTargetLabel) {
        if ((i + 1) < this.screenshotRows.length) {
          if (this.screenshotRows[i + 1].col1.url != null) {
            this.currentTargetLabel = this.screenshotRows[i + 1].col1.timeLabel;
            this.selectedScreenShot = `${this.screenshotRows[i + 1].col1.url}`;
            return;
          }
          else {
            this.currentTargetLabel = this.screenshotRows[i + 1].col1.timeLabel;
          }
        }
      }
    }
  }
}




