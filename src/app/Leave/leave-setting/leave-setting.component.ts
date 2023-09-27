import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-Setting',
  templateUrl: './leave-setting.component.html',
  styleUrls: ['./leave-setting.component.css']
})
export class LeaveSettingComponent implements OnInit {
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
    'November', 'December'];
  isEdit : boolean = false;
  selectedHour: number;
  selectedMinute: number;
  constructor() {
  }

  ngOnInit(): void {
    const currentTime = new Date();
    this.selectedHour = currentTime.getHours();
    this.selectedMinute = currentTime.getMinutes();
  }
  toggleEdit() {
    this.isEdit = !this.isEdit;
}

  incrementHour() {
    if (this.selectedHour < 23) {
      this.selectedHour++;
      console.log(this.selectedHour)
    }
  }

  decrementHour() {
    if (this.selectedHour > 0) {
      this.selectedHour--;
    }
  }

  incrementMinute() {
    if (this.selectedMinute < 59) {
      this.selectedMinute++;
    }
  }

  decrementMinute() {
    if (this.selectedMinute > 0) {
      this.selectedMinute--;
    }
  }
}
