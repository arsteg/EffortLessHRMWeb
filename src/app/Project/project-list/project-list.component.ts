import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectService } from '../../_services/project.service';
import { NotificationService } from '../../_services/notification.service';
import { addUser, project } from '../model/project';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonService } from 'src/app/_services/common.Service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  providers: [DatePipe]
})

export class ProjectListComponent implements OnInit {
  projectList: any[];
  searchText = '';
  p: number = 1;
  date = new Date('MMM d, y, h:mm:ss a');
  project: any;
  selectedProject: any = [];
  form: FormGroup;
  updateForm: FormGroup;
  addUserForm: FormGroup;
  allAssignee: any[];
  member: any;
  userId: string;
  addUser: addUser[] = [];
  projectUserList: any;
  isChecked: true;
  firstLetter: string;
  color: string;
  selectedUser: any;
  selectedUsers = [];
  formDate = new FormGroup({ dateYMD: new FormControl(new Date()) });
  public sortOrder: string = '';
  bsValue = new Date();
  totalRecords: number // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonservice: CommonService, public datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedTime: [0, Validators.required],
      notes: ['', Validators.required]
    });

    this.updateForm = this.fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      estimatedTime: [''],
      notes: [''],
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

    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getProjectList();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getProjectList();
  }

  getProjectList() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.projectService.getprojects(pagination.skip, pagination.next).subscribe(((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
      this.totalRecords = response.data.projectCount;
    }));
  }

  dateValidator(control: AbstractControl): { [key: string]: any } | null {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    const value = control.value;
    if (value && !pattern.test(value)) {
      return { 'invalidDate': { value } };
    }
    return null;
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.projectList, event.previousIndex, event.currentIndex);
  }

  getProjectsByUser() {
    this.projectService.getProjectByUserId(this.userId).subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  onMemberSelectionChange(user) {
    this.getProjectsByUser();
  }

  addProject() {
    if (this.form.valid) {
      this.projectService.addproject(this.form.value).subscribe((result: any) => {
        const projects = result && result.data && result.data.newProject;
        this.projectList.push(projects);
        this.toastr.success('New Project', 'Successfully Added!');
        this.form.reset();
      }, err => {
        this.toastr.error('Can not be Added', 'ERROR!')
      })
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  deleteProject() {
    this.projectService.deleteproject(this.selectedProject._id)
      .subscribe(response => {
        this.ngOnInit();
        this.toastr.success('Successfully Deleted!')
      }, err => {
        this.toastr.error('Can not be Deleted', 'ERROR!')
      })
  }

  updateProject(updateForm) {
    if (updateForm.valid) {
      this.projectService.updateproject(this.selectedProject._id, updateForm).subscribe(response => {
        this.ngOnInit();
        this.toastr.success('Existing Project Updated', 'Successfully Updated!')
      }, err => {
        this.toastr.error('Can not be Updated', 'ERROR!')
      })
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  addUserToProject(addUserForm) {
    let selectedUsers = this.addUserForm.get('userName').value;
    let newUsers = selectedUsers.filter(id => !this.projectUserList.find(user => user.user.id === id));
    let project_Users = newUsers.map((id) => { return { user: id } });
    if (project_Users.length > 0) {
      this.projectService.addUserToProject(this.selectedProject.id, project_Users).subscribe(result => {
        this.ngOnInit();
        this.toastr.success('New Member Added', 'Successfully Added!')
      }, err => {
        this.toastr.error('Member Already Exist', 'ERROR!')
      })
    } else {
      this.toastr.error('All selected users already exist', 'ERROR!')
    }
  }

  getProjectUser(id) {
    this.projectService.getprojectUser(id).subscribe(response => {
      this.projectUserList = response && response.data && response.data['projectUserList'];
      if (this.projectUserList) {
        this.projectUserList = this.projectUserList.filter(user => user.user != null);
        this.selectedUser = this.projectUserList.map(user => user.user.id);
      }
    });
  }

  onModelChange(projectUserList) {
    let index = this.projectUserList.findIndex(user => user.id === projectUserList.id);
    console.log(projectUserList.id)
    this.projectService.deleteprojectUser(projectUserList.id).subscribe(response => {
      this.projectUserList.splice(index, 1);
      this.ngOnInit();
      this.toastr.success(projectUserList.user.firstName.toUpperCase(), 'Successfully Removed!')
    }, err => {
      this.toastr.error(projectUserList.user.firstName.toUpperCase(), 'ERROR! Can not be Removed')
    })
  }

  clearForm() {
    this.form.reset();
  }
}
