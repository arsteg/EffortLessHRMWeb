import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TasksService } from '../tasks.service';
import { taskComment } from 'src/app/models/task/taskComment';

@Component({
  selector: 'app-task-comment-list',
  templateUrl: './task-comment-list.component.html',
  styleUrls: ['./task-comment-list.component.css']
})
export class TaskCommentListComponent implements OnInit {
  @Input() comments: taskComment[];
  @Output() commentAdded = new EventEmitter<taskComment>();
  @Output() commentUpdated = new EventEmitter<{ index: number, text: taskComment }>();
  @Output() commentDeleted = new EventEmitter<number>();

  constructor(private taskService:TasksService){
  }

  newComment: taskComment;

  ngOnInit(){
  }

  addComment() {
    if (this.newComment) {
      this.commentAdded.emit(this.newComment);
      //this.newComment = '';
    }
  }

  updateComment(index: number, text: any) {
    this.commentUpdated.emit({ index, text });
  }

  deleteComment(index: number) {
    this.commentDeleted.emit(index);
  }
}

