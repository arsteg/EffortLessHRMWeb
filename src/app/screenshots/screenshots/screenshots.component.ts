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
    this.members.push({ id: currentUser.email, name: "Me", email: currentUser.email });
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
  showScreenShots() {
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
    })
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
          totalTime += 10;
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
    if (!row.col1) { row.col1 = new screenShotCell(`${h}:00`, null, null, null, null, null, null, null, null) }
    if (!row.col2) { row.col2 = new screenShotCell(`${h}:10`, null, null, null, null, null, null, null, null) }
    if (!row.col3) { row.col3 = new screenShotCell(`${h}:20`, null, null, null, null, null, null, null, null) }
    if (!row.col4) { row.col4 = new screenShotCell(`${h}:30`, null, null, null, null, null, null, null, null) }
    if (!row.col5) { row.col5 = new screenShotCell(`${h}:40`, null, null, null, null, null, null, null, null) }
    if (!row.col6) { row.col6 = new screenShotCell(`${h}:50`, null, null, null, null, null, null, null, null) }
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
        var hh = +fileName.split('-')[0];
        var mm = +fileName.split('-')[1];
        let localTime = new Date();
        localTime.setUTCHours(hh);
        localTime.setUTCMinutes(mm);
        hh = localTime.getHours();
        mm = localTime.getMinutes();
        if (hh == r && mm <= (c * 10 + 9) && mm >= (c * 10)) {
          mm = this.padValue(mm - (mm % 10));
          result = new screenShotCell(`${hh}:${mm}`, timeLogs[i].fileString, timeLogs[i].clicks, timeLogs[i].keysPressed, timeLogs[i].scrolls, timeLogs[i].url, timeLogs[i]._id, false, true);
        }
      };
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




