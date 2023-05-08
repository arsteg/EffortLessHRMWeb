import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl  } from '@angular/platform-browser';

@Component({
  selector: 'app-view-live-screen',
  templateUrl: './view-live-screen.component.html',
  styleUrls: ['./view-live-screen.component.css']
})
export class ViewLiveScreenComponent implements OnInit {

  isStart : boolean = false;
  intervalId: any;
  userIds: string[] = [];
  userData: UserDetail;
  imageVideo: { [key: string]: SafeUrl } = {};

  users = [
    {
      id: '62dfa8d13babb9ac2072863c',
      name: 'Sandeep Kumar',
      isLivePreviewStarted: false
    },
    {
      id: '63f846e32ff78af44d597cbc',
      name: 'User Portal',
      isLivePreviewStarted: false
    }
  ];

  constructor(private http: HttpClient, private _sanitizer: DomSanitizer) {
   }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.stopBackgroundTask();
    this.closeWebSocketConnection().subscribe(result => {
      let dd = result;
    },
    error => {
      console.error(error);
    });
  }

  getLiveImages(selectedUser : SelectedUser): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/timelogs/getLiveImage`, selectedUser, httpOptions)
    .pipe(
      catchError(error => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  StartLivePreview(userId: string){
    this.userIds.push(userId);
    
    const user = this.users.find(u => u.id === userId);
    user.isLivePreviewStarted = true;
    this.startStopService(true, userId);
  }

  StopLivePreview(userId: string){
    const user = this.users.find(u => u.id === userId);
    user.isLivePreviewStarted = false;

    const index = this.userIds.indexOf(userId);
    if (index >= 0) {
      this.userIds.splice(index, 1);
    }

    if(this.userIds.length === 0){
      this.stopBackgroundTask();
    }

    this.imageVideo[userId]="";
    this.startStopService(false, userId);
  }

  backgroundTask() {
    let selectedUser = new SelectedUser();
    selectedUser.userIds = this.userIds;
    console.log("item.userId = " + this.userIds);
    this.getLiveImages(selectedUser).subscribe(result => {
      console.log("called");
      if(result.status == 'success')
        result.data.forEach(item => {
          console.log("item.userId = " + item.userId);
          this.imageVideo[item.userId] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + item.base64string);
        });
    },
    error => {
      console.error(error);      
    });
  }

  stopBackgroundTask() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  startStopService(isStart, userId){
    let startStopRequest = new StartStopRequest();
    startStopRequest.userId = userId;
    startStopRequest.isStart = isStart;
    this.StartStopLivePreviewService(startStopRequest).subscribe(result => {
      if (isStart && !this.intervalId) {
        this.intervalId = setInterval(() => {
          this.backgroundTask();
        }, 500);
      }
    },
    error => {
      console.error(error);
    }
    )
  }

  StartStopLivePreviewService(startStopRequest: StartStopRequest): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/timelogs/startStopLivePreview`, startStopRequest, httpOptions);
  }

  closeWebSocketConnection(): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlDotNet}/timelogs/closeWebSocket`, httpOptions);
  }
}

export class StartStopRequest{
  isStart: boolean;
  userId: string;
}

export class SelectedUser{
  userIds: string[];
}

export class UserDetail{
  userId: string;
  base64string: string;
  livePreview: boolean
}
