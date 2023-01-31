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
  firstLetter: string;
  color: string;
  selectedIds: string[] = [];
  selectedUser: string;

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
    this.firstLetter= firstName.charAt(0).toUpperCase();
    return colorMap[this.firstLetter] || '#000000';
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.projectList, event.previousIndex, event.currentIndex);
  }

  getProjectList() {
    let index: number;
    this.projectService.getprojectlist().subscribe((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
      // console.log(this.projectList)
      console.log(this.projectList)
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
      console.log(projectUserList.id);
      let index = this.projectUserList.findIndex(user => user.id === projectUserList.id);
      this.projectService.deleteprojectUser(projectUserList.id).subscribe(response => {
        this.projectUserList.splice(index, 1);
        this.getProjectList();
        this.toastr.success(projectUserList.user.firstName.toUpperCase(), 'Successfully Removed!')
      },
        err => {
          this.toastr.error(projectUserList.user.firstName.toUpperCase(), 'ERROR! Can not be Removed')
        })
    }
  }
 
  getColor(char: string) {
    switch (char) {
      case 'A':
        return 'a';
      case 'B':
        return 'b';
      case 'C':
        return 'c';
      case 'D':
        return 'd';
      case 'E':
        return 'e';
      case 'R':
        return 'r';
      default:
        return 'defaults';
    }
  }
}