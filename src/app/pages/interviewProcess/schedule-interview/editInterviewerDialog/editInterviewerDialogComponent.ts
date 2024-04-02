import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Subordinate } from 'src/app/models/subordinate.Model';
import { User } from 'src/app/models/user';
import { SharedModule } from 'src/app/shared/shared.Module';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { interviewer } from 'src/app/models/interviewProcess/interviewer';

@Component({
  selector: 'app-add-interviewer-dialog',
  standalone: true,
  imports:[SharedModule],
  templateUrl: './editInterviewerDialogComponent.html',
  styleUrl: './editInterviewerDialogComponent.css'
})
export class EditInterviewerDialogComponent {
  //#region Private Members
  teamOfUsers: User[] = [];
  interviewers:interviewer[]=[];
  selectedUsers: any;
  selectedUser: any;
  selectedManager: any;
  message: [] = [];
  selectedValue: any;

  constructor(private manageTeamService: ManageTeamService,
    private interviewProcessService: InterviewProcessService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private toasttt: ToastrService,
    private dialogRef: MatDialogRef<EditInterviewerDialogComponent>) {

  }
  //#endregion
  ngOnInit(): void {
    this.populateTeamOfUsers();
  }
  //#region Private methods
  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        this.getAllInterviewers();
      },
      error: error => { }
    })
  }

  getAllInterviewers() {
    this.interviewProcessService.getAllInterviewers().subscribe((response: any) => {
      this.interviewers = response && response.data;
      this.teamOfUsers.forEach((user) => {
        const isInterviewer = this.interviewers.some((interviewer) => interviewer.interviewer._id === user.id);
        user['isChecked'] = isInterviewer;
      });
    });
  }

  onModelChange(isChecked, user: User) {
    if (isChecked) {
      let subordinate: any = new Subordinate(this.selectedManager, user.id);
      this.interviewProcessService.addInterviewer(user.id).subscribe(result => {
        this.toasttt.success(user.firstName + (' ')+ user.lastName, ' added to the interviewers list!');
      },
        err => {
          this.toasttt.error(' Can not be Selected', user.firstName + (' ')+ user.lastName)
        }
      );
    } else {
        this.interviewProcessService.deleteInterviewer(user.id).subscribe(result => {
        this.toasttt.success(user.firstName + (' ')+ user.lastName, ' removed from interviewers list!');
      },
        err => {
          this.toasttt.error('Can not be Deleted', user.firstName + (' ')+ user.lastName,)
        }
      );
    }
  }
  existsInInterviewers(user:User){
    let result = false;
    this.interviewers.forEach(inteviewer => {
      if(user.id === inteviewer.interviewer._id){
        result = true;
      }
    });
    return result;
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
