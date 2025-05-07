import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);
  @Output()
  onMenuToggled = new EventEmitter<boolean>();
  @Output()
  onProfileMenuToggled = new EventEmitter<boolean>();
  @Input()
  loggedInUser: any;

  toggleMenu(){
    this.onMenuToggled.emit();
  }

  toggleProfileMenu() {
    this.onProfileMenuToggled.emit();
  }

  onLogout() {
      localStorage.removeItem('roleName');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user.email');
      localStorage.removeItem('adminView');
      localStorage.removeItem('roleId');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('loginTime');
      window.location.reload();
      this.router.navigateByUrl('/login');
    }
}
