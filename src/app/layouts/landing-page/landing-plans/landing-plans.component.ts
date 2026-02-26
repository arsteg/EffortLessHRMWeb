import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-landing-plans',
    standalone: true,
    imports: [CommonModule, MatButtonModule, CurrencyPipe],
    templateUrl: './landing-plans.component.html',
    styleUrl: './landing-plans.component.css'
})
export class LandingPlansComponent {
    private readonly subscriptionService = inject(SubscriptionService);
    private readonly router = inject(Router);

    plans: any[] = [];
    loading = false;

    ngOnInit() {
        this.getPlans();
    }

    getPlans() {
        this.loading = true;
        this.subscriptionService.getPlans().subscribe({
            next: (res: any) => {
                this.plans = res.data.filter((plan: any) => plan.IsActive);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    buyPlan(plan: any) {
        const data = {
            id: plan._id,
            timestamp: Date.now()
        };
        localStorage.setItem('landingPageSelectedPlanId', JSON.stringify(data));
        this.router.navigate(['/register']);
    }

    startTrial() {
        localStorage.removeItem('landingPageSelectedPlanId');
        this.router.navigate(['/register']);
    }
}
