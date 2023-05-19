import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TasksService } from '../../_services/tasks.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { project } from 'src/app/Project/model/project';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/common/common.service';
import { DatePipe } from '@angular/common';
import { taskComment } from 'src/app/models/task/taskComment';
import { taskAttachments, TaskAttachment, attachments } from '../task';


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
  { name: 'ACtive', faclass: "" }];

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


  constructor(private fb: FormBuilder,
    private tasksService: TasksService,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService) {
    this.updateForm = this.fb.group({
      taskName: ['', Validators.required],
      startDate: [this.tasks?.data?.task?.startDate, Validators.required],
      endDate: [this.tasks?.data?.task?.endDate, Validators.required],
      description: ['', Validators.required],
      comment: [this.tasks?.data?.task?.comment, Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: [this.tasks?.data?.task?.project?.id, Validators.required],
      status: ['', Validators.required]

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
    this.getTaskAttachments();
  }

  onCommentAdd(event: taskComment) {
    this.comments.push(event);
    this.newComment = event;
  }
  onCommentDeleted(commentId: string) {
    this.comments = this.comments.filter(comment => comment.id !== commentId);
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
      this.getTaskAttachments();
      localStorage.setItem('activeTaskId', taskId.toString());
    });
  }

  updateTask(updateForm) {
    this.tasksService.updateTask(this.tasks.data.task.id, updateForm).subscribe(response => {
      // this.tasks = response
      console.log(response)
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
            taskId: this.activeTaskId,
            comment: null,
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

    this.tasksService.getTaskAttachment(this.activeTaskId).subscribe(result => {
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

}

interface priority {
  name: string,
  url: string
}

interface status {
  name: string,
  faclass: string
}