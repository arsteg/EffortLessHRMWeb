import { Component, OnInit } from '@angular/core';
import { Task } from './task';
import { TasksService } from './tasks.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { response } from '../models/response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  searchText = '';
  p: number = 1;
  taskList: any;
  tasks: Task[] = [];
  date = new Date();
  addForm: FormGroup;
  updateForm: FormGroup;
  selectedTask: any;

    private toastr: ToastrService
    constructor(private tasksService: TasksService, private fb: FormBuilder, private toast: ToastrService) {
    this.addForm = this.fb.group({
      taskName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      taskName: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.listAllTasks();
  }
  listAllTasks() {
    this.tasksService.getAllTasks().subscribe((response: any) => {
      this.tasks = response && response.data && response.data['taskList'];
      console.log(this.tasks)
    })
  }

  addTask(form) {
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
