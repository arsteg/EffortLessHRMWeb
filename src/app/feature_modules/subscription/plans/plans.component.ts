import { CurrencyPipe, DatePipe, NgClass, } from '@angular/common';
import { ChangeDetectorRef, Component, inject, } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from 'src/app/_services/authentication.service';

declare let Razorpay: any;

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    NgClass
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly cdr = inject(ChangeDetectorRef)
  today: Date = new Date();
  loading: boolean = false;
  plans = [];
  subscription = this.authService.companySubscription.getValue();
  user = this.authService.currentUserSubject.getValue();

  ngOnInit() {
    if(!this.hasActiveSubscription){
      this.getPlan();
    } else {
      this.getPlan(this.subscription.plan_id)
    }
  }

  get hasActiveSubscription(){
    return this.subscription?.status === 'active'
  }

  getPlan(id?:any) {
    this.subscriptionService.getPlanByName(id || 'Membership Pan')
      .subscribe((res: any) => {
        this.plans = res.data;
      })
  }

  payNow(plan: any) {
    const payload = {
      currentPlanId: plan._id
    };
    this.loading = true;
    this.subscriptionService.createSubscription(payload)
      .subscribe((data: any) => {
        this.makePayment(data.data.subscription.subscriptionId);
      })
  }

  makePayment(id: string) {
    const options = {
      "key": "rzp_test_xQi4sKdFNrIe2z", // TODO: Set in environment file or backend
      "subscription_id": id,
      "name": this.user.firstName + ' ' + this.user.lastName,
      "description": "Auth txn for " + id,
      "handler": (response: any) => {
          response['subscriptionId'] = id;
          if (response.razorpay_payment_id) {
            this.loading = false;
            this.subscription.status = 'active';
            this.authService.currentUserSubject.next(this.subscription);
            this.router.navigate(['home/dashboard']);
          }
          this.cdr.detectChanges();
      },
      "prefill": {
        "email": this.user.email,
      },
      "modal": {
        "ondismiss": () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  }
}
