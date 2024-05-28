import { Component } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-overtime-records',
  templateUrl: './overtime-records.component.html',
  styleUrl: './overtime-records.component.css'
})
export class OvertimeRecordsComponent {
  weekDates: { day: string, date: string }[] = [];

  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.weekDates$.subscribe(dates => {
      this.weekDates = dates;
    });
  }

}
