import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TasksService } from '../../_services/tasks.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { project } from 'src/app/Project/model/project';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/common/common.service';
import { DatePipe } from '@angular/common';
import { taskComment } from 'src/app/models/task/taskComment';
import { taskAttachments, TaskAttachment, attachments, Task, SubTask, updateSubTask, updateTask } from '../task';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NavigationExtras } from '@angular/router';
import { GetTaskService } from 'src/app/_services/get-task.service';
import { ProjectService } from 'src/app/_services/project.service';

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
  subTask: any = [];
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
  ];

  selectedStatus: string = '';
  selectedPriority: any;
  activeTaskId: string = '';
  searchText = '';
  date = new Date();
  index: number;
  newComment: taskComment;
  comments: taskComment[] = [];
  commentsList: taskComment[] = [];
  fileProperties: any = {};
  taskAttachment: any = [];
  public selectedAttachment: any;
  selectedFiles: File[] = [];
  selectedFile: File[] = [];
  isEditMode: boolean;
  addForm: FormGroup;
  updateSubTasks: FormGroup;
  view = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  currentTaskProject: any;
  skip = '0';
  next = '10';
  newTask: string = '';
  id: string;
  selectedSubtask: any;
  currentSubtaskId: string;
  taskId: string;
  projectUser: any;
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100]; // Add the available options for records per page
  recordsPerPage: number = 10; // Default records per page
  totalRecords: any; // Total number of records
  currentPage: number = 1;
  noUser: [] = [];
  showEditor: boolean = false;
  @ViewChild('editor') editor: any;
  assignee: any;


  constructor(private fb: FormBuilder,
    private tasksService: TasksService,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService,
    private taskIdService: GetTaskService,
    private getTaskId: GetTaskService,
    private projectService: ProjectService) {

    this.updateForm = this.fb.group({
      taskName: ['', Validators.required],
      startDate: [this.tasks?.data?.task?.startDate, Validators.required],
      endDate: [this.tasks?.data?.task?.endDate, Validators.required],
      description: [this.tasks?.data?.task?.description, Validators.required],
      comment: [this.tasks?.data?.task?.comment, Validators.required],
      priority: [this.tasks?.data?.task?.priority, Validators.required],
      TaskUser: ['', Validators.required],
      project: [this.tasks?.data?.task?.project?.id, Validators.required],
      status: [this.tasks?.data?.task?.status, Validators.required]

    });
    this.addForm = this.fb.group({
      taskName: [''],
      title: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      estimate: [0],
      comment: ['Child Task', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: ['', Validators.required],
      taskAttachments: [[]]
    });

  }
  ngOnInit(): void {
    this.getprojects();
    this.firstLetter = this.commonService.firstletter;
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      this.getTaskAttachments();
      this.getTask(this.taskId);
      this.tasksService.getSubTask(this.taskId).subscribe((response: any) => {
        this.subTask = response && response.data && response.data['taskList']
      })
    });
    this.getTasks();
  }


  onParagraphClick() {
    this.showEditor = true;
  }

  getTask(taskId: string) {
    if (taskId) {
      this.tasksService.getTaskById(taskId).subscribe(res => {
        this.tasks = res;
        this.assignee = this.tasks.data.newTaskUserList;
        this.currentTaskProject = this.tasks.data.task;
        this.projectService.getprojectUser(this.currentTaskProject.project.id).subscribe((res: any) => {
          this.projectUser = res && res.data && res.data['projectUserList']
        });
      });

    }
  }
  removeAssignee() {
    const unassignedUserId = this.assignee[0]?.id;
    if (unassignedUserId) {
      this.tasksService.deleteTaskUser(unassignedUserId).subscribe(
        (res: any) => {
          this.assignee = []
          this.toast.success('Unassigned successfully', 'Success');
        },
        (err) => {
          this.toast.error('Task could not be Unassigned', 'ERROR!');
        }
      );
    }
  }
  getProjectNameInitials(proejctName: string): string {
    if (proejctName) {
      const words = proejctName.split(' ');
      return words.map(word => word.charAt(0).toUpperCase()).join('');
    }
    return '';
  }
  getCurrentUserTasks() {
    this.tasksService.getTaskByUser(this.currentUser.id, this.skip, this.next).subscribe(response => {
      this.taskList = response && response.data && response.data['taskList'];
      this.totalRecords = response && response.data;
      this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
      this.taskList = this.taskList.filter(taskList => taskList !== null);
    })
  }
  nextPagination() {
    const newSkip = (parseInt(this.skip) + parseInt(this.next)).toString();
    this.skip = newSkip;
    this.getCurrentUserTasks();
  }

  previousPagination() {
    const newSkip = (parseInt(this.skip) >= parseInt(this.next)) ? (parseInt(this.skip) - parseInt(this.next)).toString() : '0';
    this.skip = newSkip;
    this.getCurrentUserTasks();
  }
  updateRecordsPerPage() {
    this.currentPage = 1;
    this.skip = '0';
    this.next = this.recordsPerPage.toString();
    this.getCurrentUserTasks();
  }
  getTotalPages(): number {
    if (this.totalRecords && this.totalRecords.taskCount) {
      const totalCount = this.totalRecords.taskCount;
      return Math.ceil(totalCount / this.recordsPerPage);
    }
    return 0;
  }

  getTasks() {
    this.view = localStorage.getItem('adminView');
    if (this.view === 'admin') {
      this.listAllTasks();
    } else {
      this.getCurrentUserTasks()

    }
  }

  onCommentAdd(event: taskComment) {
    this.comments.push(event);
    this.newComment = event;
  }
  onCommentDeleted(commentId: string) {
    this.comments = this.comments.filter(comment => comment.id !== commentId);
  }

  listAllTasks() {
    this.tasksService.getAllTasks(this.skip, this.next).subscribe((response: any) => {
      this.taskList = response && response.data && response.data['taskList'];
    });
  }

  onTaskChange(taskId: any) {
    this.tasksService.getTaskById(taskId).subscribe((res: any) => {
      const task = res.data.task;
      const p_Id = task.parentTask;
      const navigationExtras: NavigationExtras = {
        queryParams: { taskId: taskId }
      };
      if (p_Id) {
        this.router.navigate(['/SubTask', task.taskNumber], navigationExtras);
      }
      else {
        this.router.navigate(['/edit-task', task.taskNumber], navigationExtras);
      }
      this.tasks = task;
      this.getTaskAttachments();
      this.getTask(taskId);
    });
  }

  updateTask() {
    const updateTask: updateTask = {
      taskName: this.updateForm.value.taskName,
      description: this.updateForm.value?.description,
      priority: this.currentTaskProject.priority,
      project: this.currentTaskProject.project.id,
      title: this.updateForm.value.taskName,
      status: this.currentTaskProject.status,
      comment: this.updateForm.value.comment
    }
    this.tasksService.updateTask(this.tasks.data.task.id, updateTask).subscribe(response => {
     this.showEditor = false;
      this.toast.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }

  onCancel(): void {
    this.getTask(this.taskId);
  }

  getprojects() {
    this.commonService.getProjectList().subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  getTaskPriorityUrl(currentPriority) {
    const priority = this.priorityList.find(x => x.name?.toLowerCase() === currentPriority?.toLowerCase());
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
  updateTaskStatus(selectedTask: Task, status: string) {
    const payload = { "status": status }
    this.tasks.data.task.status = status;
    this.tasksService.updatetaskFlex(this.tasks.data.task.id, payload).subscribe(response => {
      this.toast.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  deleteTask() {
    this.tasksService.deleteTask(this.taskId).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
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
            taskId: this.taskId,
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

  openDownloadedFile() {
    setTimeout(() => {
      const anchors = document.getElementsByTagName('a');
      for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        if (anchor.getAttribute('download') !== null) {
          anchor.click();
        }
      }
    }, 1000);
  }


  getTaskAttachments(): void {

    this.tasksService.getTaskAttachment(this.taskId).subscribe(result => {
      this.taskAttachment = result.data.newTaskAttachmentList;
    });
  }

  // Define a function to open the modal and set the selectedAttachment variable
  public openTaskAttachmentModal(attachment: any): void {
    this.selectedAttachment = attachment;
  }

  deleteTaskAttachment(taskAttachmentId: string): void {
    this.tasksService.deleteTaskAttachment(taskAttachmentId).subscribe(
      (response) => {
        // remove the attachment from the taskAttachment array
        this.taskAttachment = this.taskAttachment.filter(attachment => attachment.id !== taskAttachmentId);
      },
      (error) => {
        console.error('Error deleting task attachment:', error);
      }
    );
  }
  // Function to convert bytes to kilobytes
  convertBytesToKB(bytes: number): string {
    const kilobytes = bytes / 1024;
    return kilobytes.toFixed(2) + ' KB';
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  onSub() {
    const id: '' = this.currentUser.id
    const newTask: SubTask = {
      _id: '',
      parentTask: this.taskId,
      taskName: this.addForm.value.taskName,
      title: this.addForm.value.taskName,
      estimate: this.addForm.value.estimate,
      startDate: this.addForm.value.startDate,
      endDate: this.addForm.value.endDate,
      description: this.addForm.value?.description,
      comment: 'Child Task',
      isSubTask: false,
      priority: this.addForm.value.priority,
      taskUsers: this.view === 'admin' ? [] : [id],
      status: "ToDo",
      project: this.currentTaskProject?.project?.id,
      taskAttachments: []
    };
    const taskAttachments: taskAttachments[] = [];
    newTask.taskAttachments = taskAttachments;
    this.tasksService.addTask(newTask).subscribe((response: any) => {
      this.task = response;
      this.addForm.reset();
      this.ngOnInit();
      if (taskAttachments) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFile.length; i++) {
          const file: File = this.selectedFile[i];
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

            if (i === this.selectedFile.length - 1) {
              const taskAttachment: taskAttachments = {
                taskId: this.task.data.newTask.id,
                taskAttachments: attachments
              };

              this.tasksService.addTaskAttachment(taskAttachment).subscribe((response) => {
                this.taskAttachment = response.data['taskAttachmentList']
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
      err => {
        console.log("Error creating task!");
      }

    })
  }

  onFileSelects(event) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files.item(i);
        if (file) {
          this.selectedFile.push(file);
        }
      }
    }
  }
  onresetForm() {
    this.addForm.reset();
  }



  deleteSubTask(taskId: string) {
    this.tasksService.deleteTask(taskId).subscribe(
      response => {
        this.ngOnInit();
        this.toast.success('Successfully Deleted!');
      },
      err => {
        this.toast.error('Task Cannot be Deleted', 'Error!');
      }
    );
  }

  subTaskDetail(subTask: any) {
    const taskId = subTask.id.toString();
      const navigationExtras: NavigationExtras = {
        queryParams: { taskId: taskId }
      };
      this.router.navigate(['/SubTask', subTask.taskNumber], navigationExtras);
  }

  onSubtaskIdChanged(subtaskId: string) {
    this.currentSubtaskId = subtaskId;
  }
  updatesubTaskPriority(selectedTask: any, priority: string) {
    const payload = { "priority": priority }
    selectedTask.priority = priority;
    this.tasksService.updatetaskFlex(selectedTask.id, payload).subscribe(response => {
      this.toast.success('Task priority updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  updatesubTaskStatus(selectedTask: any, status: string) {
    const payload = { "status": status }
    selectedTask.status = status;
    this.tasksService.updatetaskFlex(selectedTask.id, payload).subscribe(response => {
      this.toast.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  addUserToTask(taskId: string, user: string): void {
    this.tasksService.addUserToTask(taskId, user).subscribe((response: any) => {
      this.assignee = response && response.data && response.data['TaskUserList'];
      this.toast.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      }
    );
  }

  downloadAttachment(url: string, attachmentName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = attachmentName;
    link.click();
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
