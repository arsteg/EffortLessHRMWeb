import { Component, Input, OnInit } from '@angular/core';
import { TimeLogService } from 'src/app/_services/timeLogService';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  selectedTab: number = 1;
  view= localStorage.getItem('adminView');
  enableDisableApprovalButton: boolean = false;
  constructor(private timeLogService: TimeLogService
    ) { }

  ngOnInit(): void {  
    this.EnableDisableButtons();
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

  EnableDisableButtons() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.timeLogService.getTeamMembers(currentUser.id).subscribe({
      next: response => {
        if(response.status == "success"){
          if(response.data.length > 0){
            this.enableDisableApprovalButton = true;
          }
        }
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }
}
