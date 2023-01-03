import { Component, OnInit } from '@angular/core';
import { ColDef, ListOption } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { ProjectService } from '../project.service';
import { NotificationService } from '../../_services/notification.service';
import { project } from '../model/project';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})

export class ProjectListComponent implements OnInit {
  // projectList: project[] = [];
  projectList : any;
  searchText = '';
  p: number = 1;
  date = new Date('MMM d, y, h:mm:ss a');

  constructor(private projectService: ProjectService, private notifyService: NotificationService) {
  }

  ngOnInit(): void {
    this.projectService.getprojectlist().subscribe((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
    })
  }

  addProject(form) {
      console.log("New Project added", form)
  }

}
