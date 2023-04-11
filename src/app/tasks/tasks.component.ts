import { Component, OnInit } from '@angular/core';
import { Task } from './task';
import { TasksService } from './tasks.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { response } from '../models/response';
import { ToastrService } from 'ngx-toastr';
import { project } from '../Project/model/project';
import { ProjectService } from '../Project/project.service';
import { UserService } from '../users/users.service';
import { User } from '../models/user';
import { CommonService } from '../common/common.service';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  providers: [UserService]
})
export class TasksComponent implements OnInit {
  searchText = '';
  p: number = 1;
  projectList: project[] = [];
  taskList: any;
  tasks:any;
  date = new Date();
  addForm: FormGroup;
  updateForm: FormGroup;
  selectedTask: any;
  allAssignee: any;
  addUserForm: FormGroup;
  firstLetter: string;
  color: string;
  projectId: string;
  taskUserList: any;
  isChecked= true;
  userId: string;
  selectedUser: any;
  selectedUsers = [];
  public sortOrder: string = ''; // 'asc' or 'desc'
  showBadge = true;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public allOption: string = "ALL"; 

  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private projectService: ProjectService,
    private tost: ToastrService,
    public commonservice: CommonService
  ) {
    this.addForm = this.fb.group({
      taskName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      taskName: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: ['', Validators.required]
    });
    this.addUserForm = this.fb.group({
      userName: {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      }
    });
  }

  ngOnInit(): void {
    this.isChecked= true;
    this.listAllTasks();
    this.commonservice.getProjectList().subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
  }

  changeStatus(newStatus: string) {
      this.tasks.status = newStatus;
      this.showBadge = true;
      console.log("Testing Status: ",this.tasks.status)
  }
 

  listAllTasks() {
    this.tasksService.getAllTasks().subscribe((response: any) => {
      this.tasks = response && response.data && response.data['taskList'];
    })
  }

  addTask(form) {
    this.tasksService.addtask(form).subscribe(response => {
      this.listAllTasks();
      this.toast.success('New Task', 'Successfully Added!')
    },
      err => {
        this.toast.error('Task Can not be Added', 'Error!')
      })
  }

  deleteTask() {
    this.tasksService.deletetask(this.selectedTask.id).subscribe(response => {

      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
  }

  updateTask(updateForm) {
    this.tasksService.updatetask(this.selectedTask._id, updateForm).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Task Can not be Updated', 'ERROR!')
      })
  }
  selectTask(selectedTask){
      this.selectedTask = selectedTask
  }
  addUserToTask(addUserForm) {
    let selectedUsers = this.addUserForm.get('userName').value;
    let newUsers = selectedUsers.filter(id => !this.taskUserList.find(user => user.user.id === id));
    let task_Users = newUsers.map((id) => { return { user: id } });
    if (task_Users.length > 0) {
    this.tasksService.addUserToTask(this.selectedTask.id, task_Users).subscribe(result => {
      this.ngOnInit();
      this.tost.success('New Member Added', 'Successfully Added!')
    },
      err => {
        this.tost.error('Member Already Exist', 'ERROR!')
      })
    }
    else {
      this.tost.error('All selected users already exist', 'ERROR!')
    }
  }
  
  getTaskUser(id) {
    this.tasksService.gettaskUser(id).subscribe(response => {
      this.taskUserList = response && response.data && response.data['taskUserList'];
      this.selectedUser = this.taskUserList.map(user => user.user.id);
    });
  }

//  Method to Delete assigned User to project
  onModelChange(isChecked, taskUserList) {
    if (isChecked) {
     this.getTaskUser(taskUserList);
    }
    else {
      let index = this.taskUserList.findIndex(user => user.id === taskUserList.id);
      this.tasksService.deleteTaskUser(taskUserList.id).subscribe(response => {
        this.taskUserList.splice(index, 1);
       
        this.ngOnInit();
        this.isChecked = true;
        this.tost.success(taskUserList.user.firstName.toUpperCase(), 'Successfully Removed!')
      },
        err => {
          this.tost.error(taskUserList.user.firstName.toUpperCase(), 'ERROR! Can not be Removed')
        })
    }
  }
 
  getTasksByProject() {
    this.tasksService.getTaskByProjectId(this.projectId).subscribe(response => {
      this.tasks = response && response.data && response.data['taskList'];
    });
  }
  onProjectSelectionChange(project) {
    this.getTasksByProject();
  }

  getTaskByUsers(){
    this.tasksService.getTaskByUser(this.userId).subscribe(response => {
      this.tasks = response && response.data && response.data['taskList'];
    });
  }
  onMemberSelectionChange(project) {
    this.getTaskByUsers();
  }
  getCurrentUserTasks(){
    this.tasksService.getTaskByUser(this.currentUser.id).subscribe(response => {
      this.tasks = response && response.data && response.data['taskList'];
    })
  }
}
