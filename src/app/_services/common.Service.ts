import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { applicationStatus } from '../models/interviewProcess/applicationStatus';
import { candidateDataField } from '../models/interviewProcess/candidateDataField';
import { candidate } from '../models/interviewProcess/candidate';
import { candidateDataFieldValue } from '../models/interviewProcess/candidateDataFieldValue';
import { feedbackField } from '../models/interviewProcess/feedbackField';
import { InterviewDetail } from '../models/interviewProcess/candidateInterviewDetail';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { UserService } from './users.service';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends baseService {

  allAssignee: any[];
  projectList: any[];
  firstletter: string;
  private currentProfileSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private currentProfileRoleSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private jwtToken: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private filterParams: any = {};
  private selectedTabSubject = new BehaviorSubject<number>(1); // Default selected tab is 1
  selectedTab$ = this.selectedTabSubject.asObservable();
  private weekDatesSubject = new BehaviorSubject<{ day: string, date: string }[]>([]);
  weekDates$ = this.weekDatesSubject.asObservable();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }),
    withCredentials: true
  };
  constructor(private userService: UserService,
    private projectService: ProjectService,
    private http: HttpClient) {
    super();
  }

  populateUsers(): Observable<any> {
    return this.userService.getUserList().pipe(
      map(result => {
        this.allAssignee = result && result.data && result.data.data;
        return result;
      })
    );
  }
  getProjectList(): Observable<any> {
    return this.projectService.getprojects('', '').pipe(
      map((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
        return response;
      })
    );
  }

  getRandomColor(firstName: string) {
    let colorMap = {
      A: '#76bc21',
      B: '#faba5c',
      C: '#0000ff',
      D: '#ffff00',
      E: '#00ffff',
      F: '#ff00ff',
      G: '#f1421d',
      H: '#1633eb',
      I: '#f1836c',
      J: '#824b40',
      K: '#256178',
      L: '#0d3e50',
      M: '#3c8dad',
      N: '#67a441',
      O: '#dc57c3',
      P: '#673a05',
      Q: '#ec8305',
      R: '#00a19d',
      S: '#2ee8e8',
      T: '#5c9191',
      U: '#436a2b',
      V: '#dd573b',
      W: '#424253',
      X: '#74788d',
      Y: '#16cf96',
      Z: '#4916cf'
    };
    this.firstletter = firstName?.charAt(0).toUpperCase();
    return colorMap[this.firstletter] || '#000000';
  }

  setCurrentUser(profile: any): void {
    this.currentProfileSubject.next(profile);
  }

  getCurrentUser(): BehaviorSubject<any> {
    console.log(this.currentProfileSubject);
    return this.currentProfileSubject;
  }

  setCurrentUserRole(role: any): void {
    this.currentProfileRoleSubject.next(role);
  }

  getCurrentUserRole(): BehaviorSubject<any> {
    return this.currentProfileRoleSubject;
  }

  setJwt(token: any): void {
    this.jwtToken.next(token);
  }

  getJwt(): BehaviorSubject<any> {
    return this.jwtToken;
  }

  setFilters(params: any) {
    this.filterParams = params;
  }

  getFilters() {
    return this.filterParams;
  }
  get isCollapsedMenu(): boolean {
    const storedValue = localStorage.getItem('sidebar');
    return storedValue === 'true';
  }
  setSelectedTab(tab: number) {
    this.selectedTabSubject.next(tab);
  }
  updateWeekDates(weekDates: { day: string, date: string }[]) {
    this.weekDatesSubject.next(weekDates);
  }

  //zoom meeting api's
  createMeeting(meetingData: any): Observable<any> {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/zoom/createmeeting`, meetingData, this.httpOptions);
  }
  /// <summary>
  /// Creates a meeting signature for a Zoom meeting.
  /// </summary>
  /// <param name="signatureData">The data required to create the meeting signature.</param>
  /// <returns>An observable that emits the response from the Zoom API for creating the meeting signature.</returns>
  createMeetingSignature(signatureData: any): Observable<any> {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/zoom/createmeetingsingture`, signatureData, this.httpOptions);
  }
//zoom meeting api's

  setUserUiState(data: any): Observable<any> {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/common/UserUIState`, data, this.httpOptions);
  }

  getUserUiState(key: string): Observable<any> {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/common/UserUIState/${key}`, this.httpOptions);
  }

}
