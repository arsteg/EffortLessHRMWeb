import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-task-comment',
  templateUrl: './task-comment.component.html',
  styleUrls: ['./task-comment.component.css']
})
export class TaskCommentComponent implements OnInit {

  @Input() comment: string;
  @Output() commentUpdated = new EventEmitter<string>();
  @Output() commentDeleted = new EventEmitter<void>();

  isEditMode: boolean = false;
  editedComment: string;

  ngOnInit() {
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

