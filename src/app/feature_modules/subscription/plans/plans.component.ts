import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, inject, DestroyRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentsComponent } from '../subscriptions-list/payments/payments.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


declare let Razorpay: any;

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    NgClass,
    MatIconModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly destoryRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  private readonly ngZone = inject(NgZone);
  changePlanForm: FormGroup;
  plans = [];
  subscription = this.authService.companySubscription.getValue();
  subscriptionId = '';
  subscribedPlan: any;
  scheduledChanges = null;
  user = this.authService.currentUserSubject.getValue();
  rzCred = '';
  selectedPlan: any;
  loading = false;
  loadingPlans = false;
  loadingSubscription = false;
  confirmPayment = null;

  ngOnInit() {
    this.credentials();
    if (!this.hasActiveSubscription && !this.hasCreatedSubscription) {
      this.getPlan();
    } else {
      this.getSubscription(this.subscription.id);
    }
    this.changePlanForm = new FormGroup({
      currentPlanId: new FormControl('', Validators.required)
    });
  }

  credentials() {
    this.subscriptionService.getCredentials()
      .pipe(takeUntilDestroyed(this.destoryRef))
      .subscribe((res: any) => {
        this.rzCred = res.data;
      });
  }

  get hasActiveSubscription() {
    return this.subscription?.status === 'active' || this.subscription?.status === 'authenticated' 
  }

  get hasCreatedSubscription() {
    return this.subscription?.status === 'created'
  }

  getSubscription(id) {
  this.loadingSubscription = true;
  this.subscriptionService.getSubscriptionById(id)
      .pipe(takeUntilDestroyed(this.destoryRef))
      .subscribe((data: any) => {
        console.log(data);
        this.subscriptionId = data.data.subscription._id;
        this.subscribedPlan = data.data.subscription.currentPlanId;
        this.subscription = data.data.subscription.razorpaySubscription;
        this.scheduledChanges = data.data.subscription.scheduledChanges;
        this.selectedPlan = this.subscribedPlan;
        this.loadingSubscription = false;
      })
  }

  getPlan() {
    this.loadingPlans = true;
    this.subscriptionService.getPlans()
      .pipe(takeUntilDestroyed(this.destoryRef))
      .subscribe((res: any) => {
        this.plans = res.data.filter((plan: any) => plan.IsActive);
        this.loadingPlans = false;
      }, () => {
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
      quantity: this.selectedPlan.quantity || 1,
    };
    this.loading = true;
    // if company have already created subscription
    if(this.hasCreatedSubscription){
      this.makePayment(this.subscription.id);
    } else {
      // Create new subscription
      this.subscriptionService.createSubscription(payload)
        .subscribe((data: any) => {
          this.makePayment(data.data.subscription.subscriptionId);
        });
    }
    return true;
  }

  makePayment(id: string) {
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

  viewPlans(content: any) {
    this.subscriptionService.getPlans()
      .pipe(takeUntilDestroyed(this.destoryRef))
      .subscribe((res: any) => {
        this.plans = res.data.filter((plan: any) => plan.IsActive);
        this.loadingPlans = false;
        const dialogRef = this.dialog.open(content, {
          width: '600px',
          data: { plans: this.plans },
        });
        dialogRef.afterClosed().subscribe(result => {
          this.changePlanForm.reset();
        });
      }, () => {
        this.loadingPlans = false;
      });
  }

  confirmChangePlan() {
    const payload = {...this.changePlanForm.value};
    payload.confirmation = true;
    this.subscriptionService.changeSubscription(this.subscriptionId, payload)
      .subscribe((response: any) => {
        this.confirmPayment = response.data;
        this.dialog.afterAllClosed.subscribe(() => {
          this.confirmPayment = null;
        });
      }, (error: any)=>{
        const message = error.error.message || 'An error occurred';
        this.snackBar.open(message, 'Close', {duration: 5000});
      });
  }

  changePlan() {
    const payload = {...this.changePlanForm.value};
    this.subscriptionService.changeSubscription(this.subscriptionId, payload)
      .subscribe((data: any) => {
        this.subscription = data.data.subscription.razorpaySubscription;
        this.scheduledChanges = data.data.subscription.scheduledChanges;
        this.subscribedPlan = data.data.subscription.currentPlanId;
        this.authService.companySubscription.next(data.data.subscription.razorpaySubscription);
        localStorage.setItem('subscription', JSON.stringify(data.data.subscription.razorpaySubscription));
        this.dialog.closeAll();
        this.snackBar.open('Plan changed successfully', 'Close', {duration: 5000});
        this.dialog.afterAllClosed.subscribe(() => {
          this.confirmPayment = null;
        });
      }, (error: any)=>{
        this.dialog.closeAll();
        const message = error.error.message || 'An error occurred';
        this.snackBar.open(message, 'Close', {duration: 5000});
      });
  }

  cancelChangePlan(){
    this.subscriptionService.cancelChangeSubscription(this.subscriptionId)
      .subscribe((data: any) => {
        this.subscription = data.data.subscription.razorpaySubscription;
        this.scheduledChanges = null;
        this.authService.companySubscription.next(data.data.subscription.razorpaySubscription);
        localStorage.setItem('subscription', JSON.stringify(data.data.subscription.razorpaySubscription));
        this.dialog.closeAll();
        this.snackBar.open('Scheduled changes cancelled successfully', 'Close', {duration: 5000});
      }, (error: any)=>{
        this.dialog.closeAll();
        const message = error.error.message || 'An error occurred';
        this.snackBar.open(message, 'Close', {duration: 5000});
      });
  }
}
