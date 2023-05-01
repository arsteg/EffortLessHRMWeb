import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../models/user';
import { ProjectService } from '../Project/project.service';
import { UserService } from '../users/users.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  allAssignee: any[];
  projectList: any[];
  firstletter: string;

  constructor(private userService: UserService,
    private projectService: ProjectService) { }

  
  populateUsers(): Observable<any> {
    return this.userService.getUserList().pipe(
      map(result => {
        this.allAssignee = result && result.data && result.data.data;
        return result;
      })
    );
  }
  getProjectList(): Observable<any> {
    return this.projectService.getprojectlist().pipe(
      map((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
        return response;
      })
    );
  }
  
  getRandomColor(firstName: string) {
    let colorMap = {
      A: '#556def',
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
}
