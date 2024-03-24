import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../models/user';
import { ProjectService } from '../_services/project.service';
import { UserService } from '../_services/users.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  allAssignee: any[];
  projectList: any[];
  firstletter: string;
  private currentProfileSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private currentProfileRoleSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private jwtToken: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private filterParams: any = {};
  private selectedTabSubject = new BehaviorSubject<number>(1); // Default selected tab is 1
  selectedTab$ = this.selectedTabSubject.asObservable();

  constructor(private userService: UserService,
    private projectService: ProjectService,
    private http: HttpClient) { }

  
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

  setCurrentUserRole(role: any): void{
    this.currentProfileRoleSubject.next(role);
  }

  getCurrentUserRole(): BehaviorSubject<any> {
    return this.currentProfileRoleSubject;
  }

  setJwt(token: any): void{
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

  
}
