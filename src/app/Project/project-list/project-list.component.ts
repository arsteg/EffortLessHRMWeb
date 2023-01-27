import { Component, OnInit } from '@angular/core';
import { ColDef, ListOption } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { ProjectService } from '../project.service';
import { NotificationService } from '../../_services/notification.service';
import { addUser, project } from '../model/project';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/users/users.service';
import { User } from 'src/app/models/user';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  providers: [UserService]
})

export class ProjectListComponent implements OnInit {
  // projectList: project[] = [];
  projectList: any;
  searchText = '';
  p: number = 1;
  date = new Date('MMM d, y, h:mm:ss a');
  project: any;
  selectedProject: any = [];
  form: FormGroup;
  updateForm: FormGroup;
  addUserForm: FormGroup;
  allAssignee: User[];
  member: any;
  userId: string;
  items: any[];
  addUser: addUser[] = [];
  projectUserList: any;
  projectId: string;
  isChecked: true;
 
  constructor(
    private projectService: ProjectService,
    private notifyService: NotificationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedTime: ['', Validators.required],
      notes: ['', Validators.required],
      firstName: ['', Validators.required]
    });

    this.updateForm = this.fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedTime: ['', Validators.required],
      notes: ['', Validators.required],
      firstName: ['', Validators.required]
    });

    this.addUserForm = this.fb.group({
      userName: {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      }
    });  
  }

  ngOnInit(): void {
    this.isChecked = true;
    this.getProjectList();
    this.populateUsers();
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.projectList, event.previousIndex, event.currentIndex);
  }

  getProjectList() {
    this.projectService.getprojectlist().subscribe((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
    })
  }


  populateUsers() {
    this.userService.getUserList().subscribe({
      next: result => {
        this.allAssignee = result.data.data;
      }
    })
  }
  getProjects() {
    this.projectService.getProjectByUserId(this.userId).subscribe(response => {
      console.log(response)
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  onMemberSelectionChange(user) {
    this.getProjects();
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
  addUserToProject(addUserForm) {
    let project_Users = this.addUserForm.get('userName').value.map((id) => { return { user: id } })
    this.projectService.addUserToProject(this.selectedProject.id, project_Users).subscribe(result => {
      this.getProjectList();
      this.toastr.success('New Member Added', 'Successfully Added!')
    },
      err => {
        this.toastr.error('Can not be Added Member', 'ERROR!')
      })
  }

  getProjectUser(id) {
    this.projectService.getprojectUser(id).subscribe(response => {
      this.projectUserList = response && response.data && response.data['projectUserList'];
    });
  }

//  Method to Delete assigned User to project
  onModelChange(isChecked, projectUserList) {
    if (isChecked) {
      this.getProjectUser(projectUserList);
    }
    else {
      console.log(projectUserList.id)
      this.projectService.deleteprojectUser(projectUserList.id).subscribe(response => {
      projectUserList.id = response && response.data && response.data['projectUserList'];
        console.log("project user list:", projectUserList.id);
      })
    }
  }

  getColor(char: string): string {
    switch (char) {
      case 'A' || 'a':
        return 'A';
      case 'B' || 'b':
        return 'B';
      case 'C' || 'c':
        return 'C';
      case 'D' || 'd':
        return 'D';
      case 'E' || 'e':
        return 'E';
      case 'R' || 'r':
        return 'R';
      default:
        return 'defaults';
    }
  }
}