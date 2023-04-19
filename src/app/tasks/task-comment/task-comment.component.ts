import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { taskComment } from 'src/app/models/task/taskComment';


@Component({
  selector: 'app-task-comment',
  templateUrl: './task-comment.component.html',
  styleUrls: ['./task-comment.component.css']
})
export class TaskCommentComponent implements OnInit {

  @Input() comment: taskComment;
  @Output() commentUpdated = new EventEmitter<taskComment>();
  @Output() commentDeleted = new EventEmitter<void>();

  isEditMode: boolean = true;
  editedComment: taskComment;

  ngOnInit() {
    this.isEditMode = true;
    this.editedComment = this.comment;
  }

  updateComment() {
    this.commentUpdated.emit(this.editedComment);
    this.isEditMode = false;
  }

  deleteComment() {
    this.commentDeleted.emit();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
}

