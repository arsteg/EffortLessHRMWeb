import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TasksService } from 'src/app/_services/tasks.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { attachments, taskAttachments } from '../task';

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
  id: string;
  taskAttachment: any = [];
  public selectedAttachment: any;
  selectedFiles: File[] = [];


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
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {

      this.tasksService.getTaskById(this.id).subscribe(task => {
        this.subtask = task.data;
      })
    }
    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    
    this.firstLetter = this.commonservice.firstletter;
    this.getTaskAttachments();
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
  onFileSelect(event) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files.item(i);
        if (file) {
          this.selectedFiles.push(file);

        }
      }
    }
    const attachments: attachments[] = [];

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file: File = this.selectedFiles[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.toString().split(',')[1];
        const fileSize = file.size; 
        const fileType = file.type; 
        const fileNameParts = file.name.split('.');
        const extension = fileNameParts[fileNameParts.length - 1];

        attachments.push({
          attachmentName: file.name,
          attachmentType: fileType,
          attachmentSize: fileSize,
          extension: extension,
          file: base64String
        });
        if (i === this.selectedFiles.length - 1) {
          const taskAttachment: taskAttachments = {
            taskId: this.id,
            taskAttachments: attachments
          };

          this.tasksService.addTaskAttachment(taskAttachment).subscribe(
            (response) => {
              this.selectedFiles = [];
              this.ngOnInit();
            },
            (error) => {
              console.error('Error creating task attachment:', error);
            }
          );
        }
      };
    }

  }
  getTaskAttachments(): void {
    this.tasksService.getTaskAttachment(this.id).subscribe(result => {
      this.taskAttachment = result.data.newTaskAttachmentList;
      console.log(this.taskAttachment)
    });
  }

  public openTaskAttachmentModal(attachment: any): void {
    this.selectedAttachment = attachment;
  }

  deleteTaskAttachment(taskAttachmentId: string): void {
    this.tasksService.deleteTaskAttachment(taskAttachmentId).subscribe(
      (response) => {
        this.taskAttachment = this.taskAttachment.filter(attachment => attachment.id !== taskAttachmentId);
      },
      (error) => {
        console.error('Error deleting task attachment:', error);
      }
    );
  }
  convertBytesToKB(bytes: number): string {
    const kilobytes = bytes / 1024;
    return kilobytes.toFixed(2) + ' KB';
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