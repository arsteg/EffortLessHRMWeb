import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-task-comment-list',
  templateUrl: './task-comment-list.component.html',
  styleUrls: ['./task-comment-list.component.css']
})
export class TaskCommentListComponent implements OnInit {
  @Input() comments: string[];
  @Output() commentAdded = new EventEmitter<string>();
  @Output() commentUpdated = new EventEmitter<{ index: number, text: string }>();
  @Output() commentDeleted = new EventEmitter<number>();

  newComment: string;

  ngOnInit() {
    this.newComment = '';
  }

  addComment() {
    if (this.newComment.trim()) {
      this.commentAdded.emit(this.newComment);
      this.newComment = '';
    }
  }

  updateComment(index: number, text: any) {
    this.commentUpdated.emit({ index, text });
  }

  deleteComment(index: number) {
    this.commentDeleted.emit(index);
  }
}

