import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansListComponent } from '../plans-list/plans-list.component';
import { PlansComponent } from '../plans/plans.component';
import { SubscriptionsListComponent } from '../subscriptions-list/subscriptions-list.component';
import { CommonService } from 'src/app/_services/common.Service';

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
  private readonly commonService = inject(CommonService);
  selectedIndex = 0;
  user: any;

  ngOnInit(){
    this.route.queryParams.subscribe((params)=>{
      this.selectedIndex = params['tab'];
    })
    this.commonService.getCurrentUser().subscribe((user)=>{
      this.user = user;
    });
  }

  onTabChange(event){
    this.selectedIndex = event.index;
    this.router.navigate([], {queryParams: {tab: event.index}})
  }
}
