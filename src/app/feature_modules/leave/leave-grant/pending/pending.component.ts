import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent {
  actionOptions = {
    approve: true,
    reject: true,
    delete: true,
    view: false
  };
  //@Input() selectedTab: number;
  selectedTab: number = Number(localStorage.getItem('leaveSelectedTab')) || 1;
  private tabSubscription: Subscription;

  constructor(private leaveService: LeaveService){}

  ngOnInit(): void {
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
