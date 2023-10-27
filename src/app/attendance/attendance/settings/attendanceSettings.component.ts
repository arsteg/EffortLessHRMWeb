import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Attendance, Timesheet } from 'src/app/reports/model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from 'src/app/_services/reports.service';
import { ProjectService } from 'src/app/_services/project.service';
import { ExportService } from 'src/app/_services/export.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-attendanceSettings',
  templateUrl: './attendanceSettings.component.html',
  styleUrls: ['./attendanceSettings.component.css'],
})

export class AttendanceSettingsComponent implements OnInit {
  selectedTab:number=1;

  constructor(
    public commonservice: CommonService,
    public datepipe: DatePipe
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    , private reportService: ReportsService
  ) {

  }

  ngOnInit(): void {

  }
  selectTab(tabIndex){
    this.selectedTab= tabIndex;
  }

}
