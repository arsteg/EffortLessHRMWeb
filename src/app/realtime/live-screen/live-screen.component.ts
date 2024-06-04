import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-live-screen',
  templateUrl: './live-screen.component.html',
  styleUrl: './live-screen.component.css'
})
export class LiveScreenComponent {
  userIds: string;
  intervalId: any;
  imageVideo: { [key: string]: SafeUrl } = {};
  imageVideoSingleUser: SafeUrl;
  liveScreenFor: any;
  isSingle:boolean=false;
  allUsers:any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private _sanitizer: DomSanitizer,
  private http: HttpClient,
  private timelog: TimeLogService,
  public commonService: CommonService,
) {
    this.userIds = data.id;
    this.isSingle = this.userIds.length == 1;
    //this.liveScreenFor = this.userIds.length>1;
    const requestBody = { users: this.userIds };
    this.timelog.createLiveScreenRecord(requestBody).subscribe(result => {
      let response = result;

      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.backgroundTask();
        }, 500);
      }
    });
  }


  ngOnInit(){
    this.commonService.populateUsers().subscribe(result => {
      this.allUsers = result && result.data && result.data.data;
    });
  }

  backgroundTask() {
    if(this.userIds.length == 1){
      const requestBody = { "users": this.userIds[0] };
      this.getLiveImages(requestBody).subscribe(result => {
        if(result.status){
          result.data.forEach(data => {
            this.imageVideoSingleUser = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + data.fileString);
          });
        }
      },
      error => {
        console.error(error);      
      });
    }
    else{
      const requestBody = { "users": this.userIds };
      this.getMultipleUsersLiveScreen(requestBody).subscribe(result => {
        if(result.status){
          result.data.forEach(data => {
            data.forEach(item => {
              this.imageVideo[item.user.id] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + item.fileString);
              console.log("item.user = " + item.user.id);
            });
          });
        }
      },
      error => {
        console.error(error);      
      });
    }
  }

  getUserDetail(id: string) {
    const matchingUser = this.allUsers?.find(user => user._id === id);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
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

  getMultipleUsersLiveScreen(selectedUser : any): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/liveTracking/getMultipleUsersLiveScreen`, selectedUser, httpOptions)
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
    const requestBody = { users: this.userIds };
      this.timelog.removeLiveScreenRecord(requestBody).subscribe(result => {
        let response = result;
    });
  }
}
