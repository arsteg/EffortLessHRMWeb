import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TasksService } from 'src/app/_services/tasks.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-subtask',
  templateUrl: './subtask.component.html',
  styleUrls: ['./subtask.component.css']
})
export class SubtaskComponent implements OnInit {
  subtask: any;
  priorityList: priority[] = [{ name: 'Urgent', url: "assets/images/icon-urgent.svg" },
  { name: 'High', url: "assets/images/icon-high.svg" },
  { name: 'Normal', url: "assets/images/icon-normal.svg" }];
  statusList: status[] = [{ name: 'ToDo', faclass: "" },
  { name: 'In Progress', faclass: "" },
  { name: 'Done', faclass: "" },
  { name: 'Closed', faclass: "" },
  { name: 'ACtive', faclass: "" }];
  addUserForm: FormGroup;
  selectedStatus: string = '';
  selectedPriority: any;
  unKnownImage = "assets/images/icon-unknown.svg";
  isEditMode: boolean;
  taskUserList: any;
  firstLetter: string;
  allAssignee: any;
  members: any;
  member: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  selectedUser: any = [];
  selectedTask: any;
  @Output() subtaskIdChanged = new EventEmitter<string>();

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private toastmsg: ToastrService,
    public commonservice: CommonService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.addUserForm = this.fb.group({
      userName: {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      }
    });
   }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {

      this.tasksService.getTaskById(id).subscribe(task => {
        this.subtask = task.data;
      })
    }
    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    
    this.firstLetter = this.commonservice.firstletter;
  }
 
  updatesubTaskPriority(selectedTask: any, priority: string) {
    const payload = { "priority": priority }
    this.subtask.priority = priority;
    this.tasksService.updatetaskFlex(this.subtask.task.id, payload).subscribe(response => {
      this.toastmsg.success('Task priority updated successfully', 'Success')
    },
      err => {
        this.toastmsg.error('Task could not be updated', 'ERROR!')
      })
  }
  updatesubTaskStatus(selectedTask: any, status: string) {
    const payload = { "status": status }
    this.subtask.status = status;
    this.tasksService.updatetaskFlex(this.subtask.task.id, payload).subscribe(response => {
      this.toastmsg.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toastmsg.error('Task could not be updated', 'ERROR!')
      })
  }
  getTaskPriorityUrl(currentPriority) {
    const priority = this.priorityList.find(x => x.name.toLowerCase() === currentPriority?.toLowerCase());
    return priority?.url ? priority?.url : this.unKnownImage;
  }

  getTaskUser(id) {
    this.tasksService.getTaskUsers(id).subscribe(response => {
      this.taskUserList = response && response.data && response.data['taskUserList'];
      // this.selectedUser = this.taskUserList.map(user => user.user.id);
    });
  }
  addUserToTask(addUserForm) {
    let selectedUsers = this.addUserForm.get('userName').value;
    let newUsers = selectedUsers.filter(id => !this.taskUserList.find(user => user.user.id === id));
    let task_Users = newUsers.map((id) => { return { user: id } });
    if (task_Users.length > 0) {
      this.tasksService.addUserToTask(this.selectedTask.id, task_Users).subscribe(result => {
        this.ngOnInit();
        this.toastmsg.success('New Member Added', 'Successfully Added!')
      },
        err => {
          this.toastmsg.error('Member Already Exist', 'ERROR!')
        })
    }
    else {
      this.toastmsg.error('All selected users already exist', 'ERROR!')
    }
  }
  gotoParentTask(taskId: string){
    this.router.navigate(['/edit-task', taskId]);
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