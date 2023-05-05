import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TasksService } from '../../_services/tasks.service';
import { TaskAttachment,  taskComment } from 'src/app/models/task/taskComment';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/common/common.service';
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
  // @Output() attachmentAdded = new EventEmitter<taskAttachment>();
  @Input() authorfirstName: string;
  @Input() authorlastName: string;
  newAttachments: TaskAttachment[] = [];

  constructor(private taskService: TasksService,
    private authentication: AuthenticationService,
    public commonService: CommonService) {
  }

  newComment: '';
  commentsArray: taskComment[] = [];
  author = JSON.parse(localStorage.getItem('currentUser'));
  task = localStorage.getItem('activeTaskId');
  firstName = localStorage.getItem('firstName');
  lastName = localStorage.getItem('lastName');

  ngOnInit() {
    this.commentsArray = [...this.comments];
    const taskId = this.task;
    this.taskService.getComments(taskId).subscribe((response) => {
      this.comments = response.data;
    });
  }

  addComment() {
    if (this.newComment) {
      const comment: taskComment = {
        id: '',
        content: this.newComment,
        author: this.author.id,
        task: this.task,
        commentedAt: new Date,
        status: '',
        authorfirstName: this.firstName,
        authorlastName: this.lastName
      };

      this.taskService.addComments(comment).subscribe((result) => {
        // update the comments array with the new comment
        this.comments.push(result);

        // emit the updated comments array to the child component
        this.commentsArray = [...this.comments];

        // emit the event to parent component
        this.commentAdded.emit(result);

        // clear the new comment field
        this.newComment = '';
        this.ngOnInit();
      });
    }
  }
  // addComment() {
  //   if (this.newComment || this.newAttachments.length > 0) {
  //     const comment: taskComment = {
  //       id: '',
  //       content: this.newComment,
  //       author: this.author.id,
  //       task: this.task,
  //       commentedAt: new Date(),
  //       status: '',
  //       authorfirstName: this.firstName,
  //       authorlastName: this.lastName,
  //     };
  
  //     this.taskService.addComments(comment).subscribe((result) => {
  //       // update the comments array with the new comment
  //       this.comments.push(result);
  
  //       // emit the updated comments array to the child component
  //       this.commentsArray = [...this.comments];
  
  //       // emit the event to parent component
  //       this.commentAdded.emit(result);
  
  //       // clear the new comment field
  //       this.newComment = '';
  
  //       // Add attachment
  //       if (this.newAttachments.length > 0) {
  //         const taskAttachment: TaskAttachments = {
  //           task: this.task,
  //           attachments: this.newAttachments,
  //           status: '',
  //           createdOn: new Date(),
  //           updatedOn: new Date(),
  //           createdBy: this.author.id,
  //           updatedBy: this.author.id,
  //           comment: result.id, // pass the comment id to the commentId field
  //         };
  //         this.taskService.addTaskAttachment(taskAttachment).subscribe(() => {
  //           // clear the new attachments array
  //           this.newAttachments = [];
  //           this.ngOnInit();
  //         });
  //       }
  //     });
  //   }
  // }
    updateComment(index: number, text: any) {
    const comment = this.comments[index];
    comment.content = text;
    this.taskService.updateComment(comment.id).subscribe((updatedComment) => {
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
}
