import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { TimeLogService } from 'src/app/_services/timeLogService';

@Component({
  selector: 'app-live-screen',
  templateUrl: './live-screen.component.html',
  styleUrl: './live-screen.component.css'
})
export class LiveScreenComponent {
  userId: string;
  intervalId: any;
  imageVideo: { [key: string]: SafeUrl } = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private _sanitizer: DomSanitizer,
  private http: HttpClient,
  private timelog: TimeLogService
) {
    this.userId = data.id;
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.backgroundTask(this.userId);
      }, 1000);
    }
  }

  backgroundTask(userId:any) {
    const requestBody = { "users": userId };
    this.getLiveImages(requestBody).subscribe(result => {
      result.data.forEach(data => {
        this.imageVideo[data.user.id] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + data.fileString);
      });
    },
    error => {
      console.error(error);      
    });
  }

  getLiveImages(selectedUser : any): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/liveTracking/getUsersLiveScreen`, selectedUser, httpOptions)
    .pipe(
      catchError(error => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  ngOnDestroy() {
    // Clear the interval to stop the background task
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    const requestBody = { users: this.userId };
      this.timelog.removeLiveScreenRecord(requestBody).subscribe(result => {
        let response = result;
    });
  }
}
