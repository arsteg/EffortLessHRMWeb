import { CurrencyPipe, DatePipe, NgClass, } from '@angular/common';
import { ChangeDetectorRef, Component, inject, DestroyRef, NgZone } from '@angular/core';
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
  private readonly ngZone = inject(NgZone);
  plans = [];
  subscription = this.authService.companySubscription.getValue();
  subscribedPlan: any;
  user = this.authService.currentUserSubject.getValue();
  rzCred = '';
  selectedPlan: any;
  loading = false;
  loadingPlans = false;

  ngOnInit() {
    if (!this.hasActiveSubscription) {
      this.credentials();
      this.getPlan();
    } else {
      this.getSubscription(this.subscription.id);
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

  getSubscription(id){
    this.subscriptionService.getSubscriptionById(id)
    .pipe(takeUntilDestroyed(this.destoryRef))
    .subscribe((data: any) => {
      console.log(data);
      this.subscribedPlan = data.data.subscription.currentPlanId;
      this.subscription = data.data.subscription.razorpaySubscription;
    })
  }

  getPlan() {
    this.loadingPlans = true;
      this.subscriptionService.getPlans()
      .pipe(takeUntilDestroyed(this.destoryRef))
      .subscribe((res: any) => {
          this.plans = res.data.filter((plan: any) => plan.IsActive);
          this.loadingPlans = false;
        }, ()=>{
          this.loadingPlans = false;
        });
  }

  payNow() {
    if (!this.rzCred) {
      alert('Please contact admin to setup payment gateway');
      return false;
    }
    const payload = {
      currentPlanId: this.selectedPlan._id,
      quantity: this.selectedPlan.quantity,
    };
    this.loading = true;
    this.subscriptionService.createSubscription(payload)
      .subscribe((data: any) => {
        this.makePayment(data.data.subscription.subscriptionId, this.selectedPlan);
      });
    return true;
  }

  makePayment(id: string, plan: any) {
    console.log(this.user)
    const options = {
      "key": this.rzCred, // TODO: Set in environment file or backend
      "subscription_id": id,
      "name": this.user.firstName + ' ' + this.user.lastName,
      "description": "Payment for subscription " + id,
      "handler": (response: any) => {
        console.log(response);
        response['subscriptionId'] = id;
        if (response.razorpay_payment_id) {
          this.subscription.status = 'active';
          this.subscription.created_at = new Date().getTime() / 1000;
          this.subscription.current_start = new Date().getTime() / 1000;
          this.subscription.id = id;
          this.subscriptionService.activateSubscription(id)
            .subscribe((data: any) => {
              this.ngZone.run(() => {
                this.authService.companySubscription.next(data.data.subscription.razorpaySubscription);
                localStorage.setItem('subscription', JSON.stringify(data.data.subscription.razorpaySubscription));
                this.loading = false;
                if (localStorage.getItem('roleId') === '639acb77b5e1ffe22eaa4a39') {
                  this.router.navigate(['home/dashboard']);
                } else {
                  this.router.navigate(['home/dashboard/user']);
                }
              });
            });
        } else {
          this.loading = false;
        }
      },
      "prefill": {
        "email": this.user.email || '',
      },
      "modal": {
        "ondismiss": () => {
          this.ngZone.run(() => {
            this.loading = false;
          });
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
