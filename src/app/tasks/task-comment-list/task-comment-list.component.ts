import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TasksService } from '../../_services/tasks.service';
import { taskComment } from 'src/app/models/task/taskComment';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/common/common.service';
import { attachments, commentAttachment, taskAttachments } from '../task';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-task-comment-list',
  templateUrl: './task-comment-list.component.html',
  styleUrls: ['./task-comment-list.component.css']
})
export class TaskCommentListComponent implements OnInit {
  @Input() comments: any = [];
  @Output() commentAdded = new EventEmitter<taskComment>();
  @Output() commentUpdated = new EventEmitter<{ index: number, text: taskComment }>();
  @Output() commentDeleted = new EventEmitter<number>();
  @Input() authorfirstName: string;
  @Input() authorlastName: string;
  @Input() subtaskId: string;
  @Input() taskId: string;

  newComment: '';
  commentsArray: taskComment[] = [];
  author = JSON.parse(localStorage.getItem('currentUser'));
  firstName = localStorage.getItem('firstName');
  lastName = localStorage.getItem('lastName');
  fileProperties: any = {};
  taskAttachment: any = [];
  public selectedAttachment: any;
  selectedFiles: File[] = [];
  comment: any = [];
  commentAttachment: any = [];
  newCommentId: string = '';
tasks:any=[]; 
id: string;

  constructor(private taskService: TasksService,
    private authentication: AuthenticationService,
    public commonService: CommonService,
    private route: ActivatedRoute
   ) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.taskService.getTaskById(this.id).subscribe(result => {
        this.tasks = result.data;
       
      })    
    }
    this.commentsArray = [...this.comments];
    const taskId = this.id;
    this.taskService.getComments(this.id).subscribe((response) => {
      this.comments = response.data;
    });
    this.getTaskAttachments();
    
    
  }

  updateComment(index: number, text: any) {
    const comment = this.comments[index];
    comment.content = text;
    this.taskService.updateComment(comment.id, comment).subscribe((updatedComment) => {
      this.commentUpdated.emit({ index, text });
    });
  }

  onDeleteComment(comment: taskComment) {
    const index = this.comments.indexOf(comment);
    if (index !== -1) {
      this.taskService.deleteComment(comment.id).subscribe(() => {
        this.comments.splice(index, 1);
      });
    }
  }
  addComment() {
    const comment: taskComment = {
      id: '',
      content: this.newComment,
      author: this.author.id,
      task: this.tasks?.task?.id,
      commentedAt: new Date,
      status: '',
      authorfirstName: this.firstName,
      authorlastName: this.lastName,
      taskAttachments: []
    };
   
    const taskAttachments: attachments[] = [];
    comment.taskAttachments = taskAttachments;

    this.taskService.addComments(comment).subscribe(response => {
      this.newCommentId = response.data.id
      this.comments.push(response);
      this.commentsArray = [...this.comments];
      this.commentAdded.emit(response);
      this.newComment = '';
      this.ngOnInit();


      if (taskAttachments) {
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
              const commentAttachment: commentAttachment = {
                taskId: this.tasks?.task?.id,
                comment: this.newCommentId,
                taskAttachments: attachments
              };

              this.taskService.addTaskAttachment(commentAttachment).subscribe((response) => {
                this.commentAttachment = response.data['taskAttachmentList']
                this.selectedFiles = []
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
    });
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
  }

  getTaskAttachments(): void {
    this.taskService.getTaskAttachment(this.id).subscribe(result => {
      this.commentAttachment = result.data.newTaskAttachmentList;
      console.log(this.commentAttachment)
    });
  }

  public openModal(attachment: any): void {
    this.selectedAttachment = attachment;
  }
  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
  deleteCommentAttachment(commentAttachmentId: string): void {
    this.taskService.deleteTaskAttachment(commentAttachmentId).subscribe(
      (response) => {
        this.ngOnInit();
        this.taskAttachment = this.taskAttachment.filter(attachment => attachment.id !== commentAttachmentId);
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