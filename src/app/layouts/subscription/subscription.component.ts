import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent {
  private readonly authService = inject(AuthenticationService);
  isTrialMode: boolean = false;
  private router = inject(Router);

  ngOnInit(): void {
    const subscription = this.authService.companySubscription.getValue();
    const user = this.authService.currentUserSubject.getValue();
    const subscriptionActive = ['active', 'authenticated'];
    if (!subscriptionActive.includes(subscription?.status) && user?.isTrial) {
      this.isTrialMode = true;
    }
  }

  logout(){
    this.authService.logout();
  }

  skipToHome() {
    this.router.navigate(['/home/dashboard']);
  }
}
