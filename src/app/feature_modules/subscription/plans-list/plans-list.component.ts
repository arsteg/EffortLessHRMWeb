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
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

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
    CommonComponentsModule
  ],
  templateUrl: './plans-list.component.html',
  styleUrl: './plans-list.component.css',
})
export class PlansListComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  readonly destroyRef = inject(DestroyRef);
  readonly snackbar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  columns = ['name', 'currentprice', 'users', 'planId', 'action'];
  newColumns = signal<TableColumn[]>([
    { key: 'name', name: 'Plan Name', },
    { key: 'currentprice', name: 'Amount' },
    { key: 'users', name: 'Max Users' },
    { key: 'planId', name: 'Plan ID' },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Copy Plan ID',
          icon: 'content_copy',
          visibility: ActionVisibility.BOTH
        },
        {
          label: 'Enable Plan',
          icon: 'visibility',
          visibility: ActionVisibility.BOTH,
          hideCondition: (row: any) => {return row.IsActive}
        },
        {
          label: 'Disable Plan',
          icon: 'visibility_off',
          visibility: ActionVisibility.BOTH,
          hideCondition: (row: any) => {return !row.IsActive}
        }
      ]
    }
  ]);
  plans = signal([]);

  ngOnInit() {
    this.getPlans();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Copy Plan ID':
        this.copyPlanId(event.row.planId)
        break;
      case 'Enable Plan':
        this.toggleActivePlan(event.row._id, event.row.IsActive)
        break;
      case 'Disable Plan':
        this.toggleActivePlan(event.row._id, event.row.IsActive)
        break;
    }
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
      data: { plan }
    });
  }

  toggleActivePlan(id: string, status: boolean) {
    status = !status
    this.subscriptionService
      .updatePlan(id, { IsActive: status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.getPlans();
        this.snackbar.open(`Plan ${status ? 'enabled' : 'disabled'} successfully`, 'OK');
      });
  }
}
