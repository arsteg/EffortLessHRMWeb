import { Component, inject, DestroyRef, signal } from '@angular/core';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreatePlanComponent } from './create-plan/create-plan.component';
import { MatMenuModule } from '@angular/material/menu';
import { PlanDetailsComponent } from '../subscriptions-list/plan-details/plan-details.component';

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
  ],
  templateUrl: './plans-list.component.html',
  styleUrl: './plans-list.component.css',
})
export class PlansListComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  readonly destroyRef = inject(DestroyRef);
  readonly snackbar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  columns = ['name', 'currentprice', 'quantity', 'planId', 'action'];
  plans = signal([]);

  ngOnInit() {
    this.getPlans();
  }

  getPlans() {
    this.subscriptionService
      .getPlans()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.plans.set(response.data);
      });
  }

  copyPlanId(planId: string) {
    const inputTag = document.createElement('input');
    inputTag.value = planId;
    inputTag.select();
    inputTag.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(inputTag.value);
    this.snackbar.open(`${planId} copied`, 'OK', { duration: 3000 });
  }

  openCreatePlanDialog() {
    const dialogRef = this.dialog.open(CreatePlanComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'success') {
        this.getPlans();
        this.snackbar.open('Plan created successfully', 'OK');
      }
    });
  }

  openPlanDetailsDialog(plan: any) {
    this.dialog.open(PlanDetailsComponent, {
      width: '500px',
      data: {plan}
    });

  }
}