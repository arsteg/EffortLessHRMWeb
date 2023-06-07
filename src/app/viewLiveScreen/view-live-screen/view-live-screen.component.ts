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
      name: 'Sandeep',
      isLivePreviewStarted: false
    },
    {
      id: '6390cbc4869680bf0202f212',
      name: 'Rukhsana',
      isLivePreviewStarted: false
    },
    {
      id: '62e361b69a34b798d5e9f7fe',
      name: 'Harsha',
      isLivePreviewStarted: false
    },
    {
      id: '631b0654bb2085e03db1bfe2',
      name: 'Ashish',
      isLivePreviewStarted: false
    },
    {
      id: '632be45f36ad0a43f45dcda9',
      name: 'Asad',
      isLivePreviewStarted: false
    },
    {
      id: '63689d7b25fb213660992f67',
      name: 'Anuj',
      isLivePreviewStarted: false
    },
    {
      id: '6391710c2434763ef9fef3ac',
      name: 'Sapana',
      isLivePreviewStarted: false
    },
    {
      id: '646311c378764ee7df205c06',
      name: 'Kalpana',
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
    return this.http.get<any>(`${environment.apiUrlDotNet}/liveTracking/getByUserId/${selectedUser.userIds[0]}`, httpOptions)
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
      this.imageVideo[selectedUser.userIds[0]] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + result[0].fileString);
      // if(result.status == 'success'){
      //   result.data.forEach(item => {
      //     console.log("item.userId = " + item.userId);
      //     this.imageVideo[item.userId] = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + item.base64string);
      //   });
      // }
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
    return this.http.post<any>(`${environment.apiUrlDotNet}/liveTracking/startstoplivepreview`, startStopRequest, httpOptions);
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
    return this.http.get<any>(`${environment.apiUrlDotNet}/liveTracking/closeWebSocket`, httpOptions);
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
