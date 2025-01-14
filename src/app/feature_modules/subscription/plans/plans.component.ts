import { CurrencyPipe, DatePipe, NgClass, } from '@angular/common';
import { ChangeDetectorRef, Component, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PaymentsComponent } from '../subscriptions-list/payments/payments.component';
import { MatIconModule } from '@angular/material/icon';


declare let Razorpay: any;

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    NgClass,
    MatIconModule
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destoryRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  today: Date = new Date();
  plans = [];
  subscription = this.authService.companySubscription.getValue();
  user = this.authService.currentUserSubject.getValue();
  rzCred = '';

  ngOnInit() {
    if (!this.hasActiveSubscription) {
      this.credentials();
      this.getPlan();
    } else {
      this.getPlan(this.subscription.plan_id);
    }
  }

  credentials() {
    this.subscriptionService.getCredentials()
      .pipe(takeUntilDestroyed(this.destoryRef))
      .subscribe((res: any) => {
        this.rzCred = res.data;
      });
  }

  get hasActiveSubscription() {
    return this.subscription?.status === 'active'
  }

  getPlan(id?: any) {
    if (id) {
      this.subscriptionService.getPlanByName(id)
        .subscribe((res: any) => {
          this.plans = res.data;
        });
    } else {
      this.subscriptionService.getPlans()
        .subscribe((res: any) => {
          this.plans = res.data.filter((plan: any) => plan.IsActive);
        });
    }
  }

  payNow(plan: any) {
    if (!this.rzCred) {
      alert('Please contact admin to setup payment gateway');
      return false;
    }
    const payload = {
      currentPlanId: plan._id,
      quantity: plan.quantity,
    };
    plan['loading'] = true;
    this.subscriptionService.createSubscription(payload)
      .subscribe((data: any) => {
        this.makePayment(data.data.subscription.subscriptionId, plan);
      });
    return true;
  }

  makePayment(id: string, plan: any) {
    const options = {
      "key": this.rzCred, // TODO: Set in environment file or backend
      "subscription_id": id,
      "name": this.user.firstName + ' ' + this.user.lastName,
      "description": "Payment for subscription " + id,
      "handler": (response: any) => {
        response['subscriptionId'] = id;
        if (response.razorpay_payment_id) {
          plan['loading'] = false;
          this.subscription.status = 'active';
          this.subscription.created_at = new Date().getTime() / 1000;
          this.subscription.current_start = new Date().getTime() / 1000;
          this.subscription.id = id;
          this.subscriptionService.activateSubscription(id)
            .subscribe((data: any) => {
              this.authService.companySubscription.next(data.subscription.razorpaySubscription);
              localStorage.setItem('subscription', JSON.stringify(data.subscription.razorpaySubscription));
              setTimeout(() => {
                if (localStorage.getItem('roleId') === '639acb77b5e1ffe22eaa4a39') {
                  this.router.navigate(['home/dashboard']);
                  this.cdr.detectChanges();
                } else {
                  this.router.navigate(['home/dashboard/user']);
                  this.cdr.detectChanges();
                }
              }, 200);
            });
        }
        this.cdr.detectChanges();
      },
      "prefill": {
        "email": this.user.email,
      },
      "modal": {
        "ondismiss": () => {
          plan['loading'] = false;
          this.cdr.detectChanges();
        }
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  }

  viewPayments() {
    this.dialog.open(PaymentsComponent, {
      data: { subscriptionId: this.subscription.id }
    });
  }
}
