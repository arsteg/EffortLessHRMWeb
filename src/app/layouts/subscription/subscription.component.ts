import { Component, inject } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent {
  private readonly authService = inject(AuthenticationService);

  logout(){
    this.authService.logout();
  }
}
