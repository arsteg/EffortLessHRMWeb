import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TasksService } from 'src/app/_services/tasks.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { attachments, taskAttachments, updateTask } from '../task';
import { GetTaskService } from 'src/app/_services/get-task.service';
import { ProjectService } from 'src/app/_services/project.service';

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
  id: any;
  taskAttachment: any = [];
  public selectedAttachment: any;
  selectedFiles: File[] = [];
  updateForm: FormGroup;
  subTaskDetail: any;
  subTask: any;
  parentTask: any;
  formDirty = false;
  projectUser: any;
  showEditor: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private toastmsg: ToastrService,
    public commonservice: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private taskIdService: GetTaskService,
    private projectService: ProjectService
  ) {
    this.addUserForm = this.fb.group({
      userName: {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      }
    });
    this.updateForm = this.fb.group({
      taskName: [this.subtask?.task?.taskName, Validators.required],
      description: [this.subtask?.task?.description, Validators.required],
      comment: ['Child Issue', Validators.required],
      priority: [this.subTask?.data?.task?.priority, Validators.required],
      project: [this.subtask?.task?.project?.id, Validators.required],
      status: [this.subTask?.data?.task?.status, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['p_Id'];
      if (this.id) {

        this.tasksService.getTaskById(this.id).subscribe((result: any) => {

          this.subtask = result.data;
          this.subTaskDetail = result.data.task;

          this.tasksService.getTaskById(this.subTaskDetail.parentTask).subscribe((result: any) => {
            this.parentTask = result.data.task;
            const currentTaskProject = this.parentTask;

            this.projectService.getprojectUser(currentTaskProject.project.id).subscribe((res: any) => {
              this.projectUser = res && res.data && res.data['projectUserList'];
            });
          });

        })

        this.updateForm.valueChanges.subscribe(() => {
          this.formDirty = this.updateForm.dirty;
        });
      }
      this.getTaskAttachments();
    })

    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });

    this.firstLetter = this.commonservice.firstletter;
    this.getTaskAttachments();
  }
  addUserToTask(taskId: string, user: string): void {
    this.tasksService.addUserToTask(taskId, user).subscribe((response: any) => {
      this.subtask = response && response.data && response.data['TaskUserList'];      
      console.log(this.subtask)
      this.toastmsg.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toastmsg.error('Task could not be updated', 'ERROR!')
      }
    );
  }
  removeAssignee() {
    const unassigned = this.subtask.newTaskUserList[0].id;
    // console.log("Assignee",this.subtask.newTaskUserList[0].id);
    this.tasksService.deleteTaskUser(unassigned).subscribe((res: any)=>{
      console.log(res)
      this.toastmsg.success('UnAssigned successfully', 'Success')
    },
      err => {
        this.toastmsg.error('Task could not be Unassigned', 'ERROR!')
      });
  }
  getProjectNameInitials(projectName: string): string {
    if (projectName) {
      const words = projectName.split(' ');
      return words.map(word => word.charAt(0).toUpperCase()).join('');
    }
    return '';
  }


  updatesubTaskPriority(selectedTask: any, priority: string) {
    const payload = { "priority": priority }
    this.subtask.priority = priority;
    this.tasksService.updatetaskFlex(this.subtask.task.id, payload).subscribe(response => {
      this.ngOnInit();
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
      this.ngOnInit();
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
  updateTask() {
    const updateTask: updateTask = {
      taskName: this.updateForm.value.taskName,
      description: this.updateForm.value.description,
      priority: this.subTaskDetail.priority,
      project: this.updateForm.value.project?.id,
      title: this.updateForm.value.taskName,
      status: this.subTaskDetail.status,
      comment: this.updateForm.value.comment
    }
    this.tasksService.updateTask(this.id, updateTask).subscribe(response => {
      this.ngOnInit();
      this.toastmsg.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toastmsg.error('Task could not be updated', 'ERROR!')
      })
  }
  deleteTask() {
    this.tasksService.deleteTask(this.id).subscribe(response => {
      this.ngOnInit();
      this.toastmsg.success('Successfully Deleted!')
    },
      err => {
        this.toastmsg.error('Task Can not be Deleted', 'Error!');
      })
  }
  getTaskUser(id) {
    this.tasksService.getTaskUsers(id).subscribe(response => {
      this.taskUserList = response && response.data && response.data['taskUserList'];
      this.selectedUser = this.taskUserList.map(user => user.user.id);
    });
  }
  // addUserToTask(addUserForm) {
  //   let selectedUsers = this.addUserForm.get('userName').value;
  //   let newUsers = selectedUsers.filter(id => !this.taskUserList.find(user => user.user.id === id));
  //   let task_Users = newUsers.map((id) => { return { user: id } });
  //   if (task_Users.length > 0) {
  //     this.tasksService.addUserToTask(this.id, task_Users).subscribe(result => {
  //       const res = result;
  //       this.ngOnInit();
  //       this.toastmsg.success('New Member Added', 'Successfully Added!')
  //     },
  //       err => {
  //         this.toastmsg.error('Member Already Exist', 'ERROR!')
  //       })
  //   }
  //   else {
  //     this.toastmsg.error('All selected users already exist', 'ERROR!')
  //   }
  // }


  gotoParentTask(task: any) {
    const taskId = task.id.toString();
    const navigationExtras: NavigationExtras = {
      queryParams: { taskId: taskId }
    };
    console.log(taskId)
    this.router.navigate(['/edit-task', task.taskNumber], navigationExtras);
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
    // --------------------------
    const attachments: attachments[] = [];

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file: File = this.selectedFiles[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.toString().split(',')[1];
        const fileSize = file.size; // size of the file in bytes
        const fileType = file.type; // type of the file (e.g. image/png)
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
          // This is the last file, so create the task attachment
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
  onInputClick() {
    this.showEditor = true;
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