import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-approved-application',
  templateUrl: './approved-application.component.html',
  styleUrl: './approved-application.component.css'
})
export class ApprovedApplicationComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
  //@Input() selectedTab: number;
  selectedTab: number = Number(localStorage.getItem('leaveSelectedTab')) || 1;
  private tabSubscription: Subscription;
  
  constructor(private leaveService: LeaveService){}
  
  ngOnInit(){
    this.tabSubscription = this.leaveService.getSelectedTab().subscribe(tab => {
        this.selectedTab = tab;
    });  
   }
  
  ngOnDestroy(): void {
    if (this.tabSubscription) {
      this.tabSubscription.unsubscribe();
    }
  }
}
