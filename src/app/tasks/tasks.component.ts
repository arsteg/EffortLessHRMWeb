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
  tasks: Task[] = [];
  date = new Date();
  addForm: FormGroup;
  updateForm: FormGroup;
  selectedTask: any;
  allAssignee: User[] = [];
  addUserForm: FormGroup;
  firstLetter: string;
  color: string;
  projectId: string;

  private toastr: ToastrService
  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private projectService: ProjectService,
    private userService: UserService,
    private tost: ToastrService
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
    this.listAllTasks();
    this.getProjectList();
    this.populateUsers();
  }

  getProjectList() {
    this.projectService.getprojectlist().subscribe((response: any) => {
      this.projectList = response && response.data && response.data['projectList'];
      console.log(this.projectList)
    })
  }
  listAllTasks() {
    this.tasksService.getAllTasks().subscribe((response: any) => {
      this.tasks = response && response.data && response.data['taskList'];
    })
  }
  populateUsers() {
    this.userService.getUserList().subscribe(result => {
      this.allAssignee = result.data.data;
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
    console.log("deleted", this.selectedTask.id)
    this.tasksService.deletetask(this.selectedTask.id).subscribe(response => {

      this.listAllTasks();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
  }

  updateTask(updateForm) {
    this.tasksService.updateproject(this.selectedTask._id, updateForm).subscribe(response => {
      this.listAllTasks();
      this.toast.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Task Can not be Updated', 'ERROR!')
      })
  }
  addUserToTask(addUserForm) {
    let task_Users = this.addUserForm.get('userName').value.map((firstName) => { return { user: firstName } })
    this.tasksService.addUserToTask(this.selectedTask.id, task_Users).subscribe(result => {
      console.log(task_Users)
      this.getProjectList();
      this.tost.success('New Member Added', 'Successfully Added!')
    },
      err => {
        this.tost.error('Member Already Exist', 'ERROR!')
      })
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
    this.firstLetter = firstName.charAt(0).toUpperCase();
    return colorMap[this.firstLetter] || '#000000';
  }
  
  getTasksByProject() {
    this.tasksService.getTaskByProjectId(this.projectId).subscribe(response => {
      console.log(response)
      this.taskList = response && response.data && response.data['taskList'];
    });
  }
  onMemberSelectionChange(project) {
    this.getTasksByProject();
  }
}
