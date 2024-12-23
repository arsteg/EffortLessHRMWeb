import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansListComponent } from '../plans-list/plans-list.component';
import { PlansComponent } from '../plans/plans.component';
import { SubscriptionsListComponent } from '../subscriptions-list/subscriptions-list.component';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    MatTabsModule,
    PlansListComponent,
    PlansComponent,
    SubscriptionsListComponent
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  selectedIndex = 0;

  ngOnInit(){
    this.route.queryParams.subscribe((params)=>{
      this.selectedIndex = params['tab'];
    })
  }

  onTabChange(event){
    this.selectedIndex = event.index;
    this.router.navigate([], {queryParams: {tab: event.index}})
  }
}
