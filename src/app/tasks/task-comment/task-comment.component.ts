import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TaskAttachment, taskComment } from 'src/app/models/task/taskComment';
import { TasksService } from '../../_services/tasks.service';
import { UserService } from 'src/app/_services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-task-comment',
  templateUrl: './task-comment.component.html',
  styleUrls: ['./task-comment.component.css']
})
export class TaskCommentComponent implements OnInit {

  @Input() comment: taskComment;
  @Output() commentUpdated = new EventEmitter<{ index: number, text: string }>();
  @Output() commentDeleted = new EventEmitter<taskComment>();
  @Input() authorfirstName: string;
  @Input() authorlastName: string;
  @Input() attachments: TaskAttachment[]; 

  isEditMode: boolean = false;
  editedComment: taskComment;
  index: number;
  tempComment: taskComment;
  firstLetter: string;

  constructor(
    private taskService: TasksService,
    private userService: UserService,
    private dialog: MatDialog,
    private toastmsg: ToastrService,
    public commonService: CommonService
    ){

  }
  ngOnInit() {
    this.isEditMode = false;
    this.editedComment = this.comment;
    this.editedComment = { ...this.comment };
    this.firstLetter = this.commonService.firstletter;
  }

    updateComment() {
    this.commentUpdated.emit({ index: this.index, text: this.editedComment.content });
    this.isEditMode = false;
  }

  deleteComment() {
    this.commentDeleted.emit(this.comment);
  }
  openDialog(comment: taskComment): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: comment
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteComment();
        this.toastmsg.success('Comment', 'Successfully Deleted !!!')
      }
      err => {
        this.toastmsg.error('This Comment Can not be Deleted', 'Error!')
      }
    });
  }
  toggleEditMode() {
    if (this.isEditMode) {
      this.editedComment = this.tempComment;
    } else {
      this.tempComment = {...this.editedComment};
    }
    this.isEditMode = !this.isEditMode;
  }
}