import { Component, OnInit } from '@angular/core';
import { ColDef, ListOption } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { ProjectService } from '../project.service';
import { NotificationService } from '../../_services/notification.service';
import { project } from '../model/project';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})

export class ProjectListComponent implements OnInit {
  // projectList: project[] = [];
  projectList: any;
  searchText = '';
  p: number = 1;
  date = new Date('MMM d, y, h:mm:ss a');
  project: any;
  selectedProject: any;
  form: FormGroup;
  updateForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private notifyService: NotificationService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedTime: ['', Validators.required],
      notes: ['', Validators.required]
    });

    this.updateForm = this.fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedTime: ['', Validators.required],
      notes: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.getProjectList();
  }

  getProjectList() {
    this.projectService.getprojectlist().subscribe((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
    })
  }

  addProject(form) {
    this.projectService.addproject(form).subscribe(result => {
      this.getProjectList();
      this.toastr.success('New Project', 'Successfully Added!')
    },
      err => {
        this.toastr.error('Can not be Added', 'ERROR!')
      }
    )
  }

  deleteProject() {
    this.projectService.deleteproject(this.selectedProject._id)
      .subscribe(response => {
        this.getProjectList();
        this.toastr.success('Successfully Deleted!')
      },
        err => {
          this.toastr.error('Can not be Deleted', 'ERROR!')
        })
  }

  updateProject(updateForm) {
    this.projectService.updateproject(this.selectedProject._id, updateForm).subscribe(response => {
      this.getProjectList();
      this.toastr.success('Existing Project Updated', 'Successfully Updated!')
    },
      err => {
        this.toastr.error('Can not be Updated', 'ERROR!')
      })
  }

}
