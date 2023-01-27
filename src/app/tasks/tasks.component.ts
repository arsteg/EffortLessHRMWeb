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
  projectList: project[]=[];
  taskList: any;
  tasks: Task[] = [];
  date = new Date();
  addForm: FormGroup;
  updateForm: FormGroup;
  selectedTask: any;
  allAssignee: User[] = [];
  
    private toastr: ToastrService
    constructor(
      private tasksService: TasksService,
      private fb: FormBuilder,
      private toast: ToastrService,
      private projectService: ProjectService,
      private userService: UserService
      ){
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
  }

  ngOnInit(): void {
    this.listAllTasks();
    this. getProjectList();
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
       
        console.log(this.allAssignee)
      })
  }

  addTask(form) {
//  let newTask = { ...form.value, result: this.allAssignee}
     this.tasksService.addtask(form).subscribe( response =>
     {
        this.listAllTasks();
        this.toast.success('New Task','Successfully Added!')
      },
    err => {
      this.toast.error('Task Can not be Added','Error!')
    })
  }
 
  deleteTask() {
    console.log("deleted", this.selectedTask.id)
    this.tasksService.deletetask(this.selectedTask.id).subscribe( response =>{
     
      this.listAllTasks();
      this.toast.success('Successfully Deleted!')
    },
    err=>{
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

  
}
