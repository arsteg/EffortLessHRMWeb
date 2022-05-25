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
  //public rowData: any[] = [];

  constructor(  private projectService: ProjectService, private notifyService : NotificationService) { }
 rowData = [
     { projectName: 'Toyota1', startDate: 'Celica', endDate: 35000 , estimatedTime: 'Toyota', notes: 'Celica', company: 35000,
     createdOn: 'Toyota', createdBy: 'Celica',updatedOn: 'Toyota', updatedBy: 'Celica'},
     { projectName: 'Toyota1', startDate: 'Celica', endDate: 35000 , estimatedTime: 'Toyota', notes: 'Celica', company: 35000,
     createdOn: 'Toyota', createdBy: 'Celica',updatedOn: 'Toyota', updatedBy: 'Celica'},
     { projectName: 'Toyota1', startDate: 'Celica', endDate: 35000 , estimatedTime: 'Toyota', notes: 'Celica', company: 35000,
     createdOn: 'Toyota', createdBy: 'Celica',updatedOn: 'Toyota', updatedBy: 'Celica'},
 ];
  ngOnInit(): void {
   }
    
  
  columnDefs: ColDef[] = [
    { field: 'projectName'},
    { field: 'startDate' ,
    width:100},
    { field: 'endDate',width:100 },
    {field:'estimatedTime',width:100},
    {field:'notes',width:300},
    {field:'company',width:200},
    {field:'createdOn',width:120},
    {field:'createdBy',width:120},  
    {field:'updatedOn',width:120},
    {field:'updatedBy',width:120},
];



}
