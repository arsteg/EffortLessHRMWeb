import { Component, inject, DestroyRef, signal } from '@angular/core';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { PlanDetailsComponent } from './plan-details/plan-details.component';
import { ConfirmCancelComponent } from './confirm-cancel/confirm-cancel.component';

@Component({
  selector: 'app-subscriptions-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './subscriptions-list.component.html',
  styleUrl: './subscriptions-list.component.css'
})
export class SubscriptionsListComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dialog = inject(MatDialog);

  subscriptions = signal([]);
  columns = ['status', 'companyName', 'email','startAt', 'endAt', 'id', 'planId', 'action'];

  ngOnInit(){
    this.getSubscriptions();
  }

  getSubscriptions(){
    this.subscriptionService.getSubscriptions()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((response:any)=>{
      this.subscriptions.set(response.data.subscriptions);
    })
  }

  openPlanDetailsDialog(planId) {
    const dialogRef = this.dialog.open(PlanDetailsComponent, {
      width: '500px',
      data: {id: planId}
    });

    dialogRef.afterClosed().subscribe((result: any) => {});
  }

  pauseResume(subscription){
    const payload = {
      subscriptionId: subscription.subscriptionId,
      action: subscription?.razorpaySubscription.status === 'active' ? 'pause' : 'resume'
    }
    this.subscriptionService.pauseResumeSubscription(payload)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((response: any)=>{
      this.getSubscriptions();  
    })
  }

  cancel(subscription){
    const dialogRef = this.dialog.open(ConfirmCancelComponent,
      {
        width: '500px',
        data: subscription
      });
    dialogRef.afterClosed().subscribe((result:any)=>{
      if(typeof result === 'number'){
        const payload = {
          subscriptionId: subscription.subscriptionId,
          cancelAtCycleEnd: result
        }
        this.subscriptionService.cancelSubscription(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response: any)=>{
          this.getSubscriptions();
        })
      }
    })
  }
}
