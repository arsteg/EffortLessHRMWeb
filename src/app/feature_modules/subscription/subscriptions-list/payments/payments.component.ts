import { Component, inject, DestroyRef, signal } from '@angular/core';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [MatTableModule, CommonModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<PaymentsComponent>);
  private readonly dialogData = inject(MAT_DIALOG_DATA);
  paymentsData = signal<any>(null);
  loading = signal<boolean>(false);
  displayedColumns: string[] = ['date', 'amount', 'method', 'invoice_id'];
  dataSource = signal<any[]>([]);

  ngOnInit() {
    const subscriptionId = this.getSubscriptionIdFromDialogData();
    this.fetchPayments(subscriptionId);
  }

  fetchPayments(subscriptionId: string) {
    this.loading.set(true);
    this.subscriptionService.getInvoiceByCompany()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (data: any) => {
          this.paymentsData.set(data);
          this.dataSource.set(data?.data?.invoice);
          this.loading.set(false);
          console.log('Payments data:', data);
        },
        (error) => {
          this.loading.set(false);
          console.error('Error fetching payments:', error);
        }
      );
  }

  private getSubscriptionIdFromDialogData(): string {
    return this.dialogData.subscriptionId;
  }
}
