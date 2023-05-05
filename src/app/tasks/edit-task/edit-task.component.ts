import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TasksService } from '../../_services/tasks.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { project } from 'src/app/Project/model/project';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/common/common.service';
import { DatePipe } from '@angular/common';
import { taskComment } from 'src/app/models/task/taskComment';
@Component({
  providers: [DatePipe],
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  selectedTask: any;
  updateForm: FormGroup;
  projectList: project[] = [];
  tasks: any = [];
  task: any = [];
  priorityList: priority[] = [{ name: 'Urgent', url: "assets/images/icon-urgent.svg" },
  { name: 'High', url: "assets/images/icon-high.svg" },
  { name: 'Normal', url: "assets/images/icon-normal.svg" }];
  unKnownImage = "assets/images/icon-unknown.svg";
  firstLetter: string;
  taskList: any = [];
  statusList: status[] = [{ name: 'ToDo', faclass: "" },
  { name: 'In Progress', faclass: "" },
  { name: 'Done', faclass: "" },
  { name: 'Closed', faclass: "" },
  { name: 'ACtive', faclass:""}];

  selectedStatus: string = '';
  selectedPriority: any;
  activeTaskId: string = '';
  searchText = '';
  date = new Date();
  index: number;
  // comments: Comment[] = [];
  newComment: taskComment;
  comments: taskComment[] = [];
  commentsList: taskComment[] = [];

  constructor(private fb: FormBuilder,
    private tasksService: TasksService,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService) {

    this.updateForm = this.fb.group({
      taskName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: ['', Validators.required],
      status: ['', Validators.required],
      estimate: [0],
      timeTaken: [0],
    });

  }

  ngOnInit(): void {
    this.getprojects();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
     
      this.tasksService.getTaskById(id).subscribe(task => {
        this.tasks = task;
        this.task = task.data.newTaskUserList
      });
      
    }
    this.firstLetter = this.commonService.firstletter;
    this.listAllTasks();
    const storedActiveTaskId = localStorage.getItem('activeTaskId');
    this.activeTaskId = storedActiveTaskId;
  }

onCommentAdd(event: taskComment) {
  console.log("Comment: ", event);
  this.comments.push(event);
  this.newComment = event;
}
onCommentDeleted(commentId: string) {
  console.log(commentId)
  this.comments = this.comments.filter(comment => comment.id !== commentId);
  console.log("to be removed: ",commentId)
}

  listAllTasks() {
    this.tasksService.getAllTasks().subscribe((response: any) => {
      this.taskList = response && response.data && response.data['taskList'];
    })
  }

  onTaskChange(taskId: string) {
    this.tasksService.getTaskById(taskId).subscribe((task: any) => {
      this.router.navigate(['/edit-task', taskId]);
      this.tasks = task;
      this.activeTaskId = taskId;
      localStorage.setItem('activeTaskId', taskId.toString());
    });
  }

  updateTask(updateForm) {
    // updateForm.taskName = updateForm.description;
   
    this.tasksService.updateTask(this.tasks.data.task.id, updateForm).subscribe(response => {
      console.log("Task Id: ",this.tasks.data.task.id)
      this.ngOnInit();
      this.toast.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  getprojects() {
    this.commonService.getProjectList().subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  getTaskPriorityUrl(currentPriority) {
    const priority = this.priorityList.find(x => x.name.toLowerCase() === currentPriority?.toLowerCase());
    return priority?.url ? priority?.url : this.unKnownImage;
  }

  updateTaskPriority(selectedTask: Task, priority: string) {
    const payload = { "priority": priority }
    this.tasks.data.task.priority = priority;
    this.tasksService.updatetaskFlex(this.tasks.data.task.id, payload).subscribe(response => {
      this.toast.success('Task priority updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  deleteTask() {
    this.tasksService.deleteTask(this.activeTaskId).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
  }
}

interface priority {
  name: string,
  url: string
}

interface status {
  name: string,
  faclass: string
}