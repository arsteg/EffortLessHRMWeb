import { Component, OnInit } from '@angular/core';
import { AppWebsiteService } from '../../../_services/appWebsite.service';
import { first, Subscription } from 'rxjs';
import { UtilsService } from '../../../_services/utils.service';
import { TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'browser-history',
  templateUrl: './browserHistory.component.html',
  styleUrls: ['./browserHistory.component.css']
})
export class BrowserHistoryComponent implements OnInit {
  startDate: string = new Date().toISOString().slice(0, 10);
  endDate: string = new Date().toISOString().slice(0, 10);
  browserHistory: any[] = [];
  userId: string;
  p: number = 1;
  intervalId: any;
  intervalDuration = 300000; 
  subscription: Subscription;

  columns: TableColumn[] = [
    {
      key: 'browser',
      name: this.translate.instant('reports.history.browser'),
      isHtml: true,
      valueFn: (row: any) => {
        if (row.browser == 1) return `<img src="assets/Browser/internet_explorer.png" alt="Edge" height="25" title="Edge">`;
        if (row.browser == 2) return `<img src="assets/Browser/firefox_browser.png" alt="Firefox" height="25" title="Firefox">`;
        if (row.browser == 4) return `<img src="assets/Browser/google_chrome.png" alt="Chrome" height="25" title="Chrome">`;
        if (row.browser == 8) return `<img src="assets/Browser/safari.png" alt="Safari" height="25" title="Safari">`;
        return '';
      }
    },
    { 
      key: 'title', 
      name: this.translate.instant('reports.history.title'), 
      valueFn: (row: any) => this.truncateString(row.title, 50) },
    { 
      key: 'uri', 
      name: this.translate.instant('reports.history.url'), 
      valueFn: (row: any) => this.truncateString(row.uri, 75) },
    { 
      key: 'lastVisitTime', 
      name: this.translate.instant('reports.history.visitTime'), 
      valueFn: (row: any) => this.truncateDate(row.lastVisitTime, 10) },
    { 
      key: 'visitCount', 
      name: this.translate.instant('reports.history.visitCount')
    }
  ];

  constructor(
    private appWebsiteService: AppWebsiteService, 
    private utilsService:UtilsService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.getBrowserHistory();
    }, this.intervalDuration);
   }
  

  getBrowserHistory(): void {
    const fromDate = this.utilsService.convertToUTC(this.convertToDateWithStartTime(this.startDate));
    const toDate = this.utilsService.convertToUTC(this.convertToDateWithEndTime(this.endDate));
    this.appWebsiteService.getBrowserHistory(fromDate, toDate, this.userId)
      .pipe(first())
      .subscribe(
        (res: any) => {
          this.browserHistory = res.data;
        },
        (err) => {
          // Handle errors here
        }
      );
  }

  selectedUsersChanged($event: string): void {
    this.userId = $event;
    this.getBrowserHistory();
  }

  onDateChange(): void {
    this.getBrowserHistory();
  }

  truncateString(input: string, maxLength: number): string {
    return input?.length <= maxLength ? input : input?.slice(0, maxLength) + '...';
  }

  truncateDate(input: string, maxLength: number): string {
    return input?.length <= maxLength ? input : input?.slice(0, maxLength);
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
  onStartDateChange(newDate: string): void {
    // Handle the date change event
    console.log('New start date:', newDate);
    // You can perform any additional actions you need
    this.getBrowserHistory();
  }

  onEndDateChange(newDate: string): void {
    // Handle the date change event
    console.log('New start date:', newDate);
    // You can perform any additional actions you need
    this.getBrowserHistory();
  }
}
