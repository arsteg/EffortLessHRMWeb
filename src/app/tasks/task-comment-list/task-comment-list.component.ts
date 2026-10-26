import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TasksService } from '../../_services/tasks.service';
import { taskComment } from 'src/app/models/task/taskComment';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/_services/common.Service';
import { attachments, commentAttachment } from '../task';
import { ActivatedRoute } from '@angular/router';
import { readFilesAsAttachments } from 'src/app/util/file-attachment-utils';
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
  taskId: string;
  subtaskId: string;
  currentProfile : any= [];
  newComment: '';
  commentsArray: taskComment[] = [];
  author = JSON.parse(localStorage.getItem('currentUser'));
  fileProperties: any = {};
  taskAttachment: any = [];
  public selectedAttachment: any;
  selectedFiles: File[] = [];
  comment: any = [];
  commentAttachment: any = [];
  newCommentId: string = '';
  tasks: any = [];
  id: any;
  userName: any;
  showEditor: boolean = false;

  constructor(private taskService: TasksService,
    private authentication: AuthenticationService,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
    if (this.taskId) {
      this.taskService.getTaskById(this.taskId).subscribe(result => {
        this.tasks = result.data;
      });
      this.commonService.getCurrentUser().subscribe((profile: any) => {
        this.currentProfile = profile;
      });
    }
    this.getTaskAttachments();
  });
  this.route.queryParams.subscribe(params => {
    this.subtaskId = params['p_Id'];
  if (this.subtaskId) {
    this.taskService.getTaskById(this.subtaskId).subscribe(result => {
      this.tasks = result.data;
    });
    this.commonService.getCurrentUser().subscribe((profile: any) => {
      this.currentProfile = profile;
    });
    this.getsubTaskAttachments();
  }
});

    this.commentsArray = [...this.comments];
    this.taskService.getComments(this.taskId || this.subtaskId).subscribe((response) => {
      this.comments = response.data;
    });

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
      authorfirstName: this.currentProfile.firstName,
      authorlastName: this.currentProfile.lastName,
      taskAttachments: []
    };

    const taskAttachments: attachments[] = [];
    comment.taskAttachments = taskAttachments;

    this.taskService.addComments(comment).subscribe(response => {
      this.newCommentId = response.data.id;
      // Push the actual comment (response.data), not the whole {status,
      // data} response wrapper — pushing `response` rendered a malformed
      // entry in the list until the ngOnInit() refetch below corrected it.
      this.comments.push(response.data);
      this.commentsArray = [...this.comments];
      this.commentAdded.emit(response.data);
      this.newComment = '';
      this.showEditor = false;
      this.ngOnInit();

      if (this.selectedFiles.length > 0) {
        // TM-022: wait for ALL files to finish reading (Promise.all) rather
        // than assuming the last array index is the last to finish —
        // FileReader callbacks for different files can resolve out of
        // order, which previously could silently drop attachments.
        readFilesAsAttachments(this.selectedFiles).then((attachmentsList) => {
          const commentAttachment: commentAttachment = {
            taskId: this.tasks?.task?.id,
            comment: this.newCommentId,
            taskAttachments: attachmentsList
          };

          this.taskService.addTaskAttachment(commentAttachment).subscribe((response) => {
            this.commentAttachment = response.data['taskAttachmentList']
            this.selectedFiles = []
            this.showEditor = false;
            this.ngOnInit();
          },
            (error) => {
              console.error('Error creating task attachment:', error);
            }
          );
        }).catch((error) => {
          console.error('Error reading selected files:', error);
        });
      }
    }, (err) => {
      console.log("Error creating comment!", err);
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
    this.taskService.getTaskAttachment(this.taskId || this.subtaskId).subscribe(result => {
      this.commentAttachment = result.data.newTaskAttachmentList;
    });
  }
  getsubTaskAttachments(): void {
    this.taskService.getTaskAttachment(this.subtaskId).subscribe(result => {
      this.commentAttachment = result.data.newTaskAttachmentList;
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
  onInputClick() {
    this.showEditor = true;
  }
  cancelEditMode(){
    this.newComment = '';
    this.showEditor = false;
  }
}
