import { Component, DestroyRef, inject, signal, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-plan-details',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './plan-details.component.html',
  styleUrl: './plan-details.component.css',
})
export class PlanDetailsComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly destroyRef = inject(DestroyRef);
  loading = signal(true);
  plan = signal(null);
  constructor(
    public dialogRef: MatDialogRef<PlanDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if(this.data.id){
      this.getPlanDetails();
    } else if(this.data.plan){
      this.plan.set(this.data.plan);
    }
  }

  getPlanDetails() {
    this.subscriptionService
      .getPlanByName(this.data.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.plan.set(response.data[0]);
        this.loading.set(false);
      });
  }
}
