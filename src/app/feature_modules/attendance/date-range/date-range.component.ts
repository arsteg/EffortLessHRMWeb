import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_services/common.Service';


@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.css'
})
export class DateRangeComponent {
  fromDate: string;
  toDate: string;
  fromDateControl: FormControl;
  toDateControl: FormControl;
  weekDates: { day: string, date: string }[] = [];

  constructor(private commonService: CommonService) {
    this.fromDateControl = new FormControl('', Validators.required);
    this.toDateControl = new FormControl('', Validators.required);
  }


  ngOnInit() {
    this.setCurrentWeek();
  }
  setCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    const saturday = new Date(today);

    sunday.setDate(today.getDate() - dayOfWeek);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));

    this.fromDate = this.formatDate(sunday);
    this.toDate = this.formatDate(saturday);

    this.fromDateControl.setValue(this.fromDate);
    this.toDateControl.setValue(this.toDate);

    this.calculateWeekDates(sunday);
  }

  navigateWeek(direction: number): void {
    const currentFromDate = new Date(this.fromDate);
    const newFromDate = new Date(currentFromDate);
    newFromDate.setDate(currentFromDate.getDate() + (direction * 7));
    const newToDate = new Date(newFromDate);
    newToDate.setDate(newFromDate.getDate() + 6);

    this.fromDate = this.formatDate(newFromDate);
    this.toDate = this.formatDate(newToDate);

    this.fromDateControl.setValue(this.fromDate);
    this.toDateControl.setValue(this.toDate);

    this.calculateWeekDates(newFromDate);
  }

  calculateWeekDates(startDate: Date): void {
    this.weekDates = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      this.weekDates.push({
        day: daysOfWeek[i],
        date: this.formatDate(currentDate)
      });
    }
    this.commonService.updateWeekDates(this.weekDates);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
