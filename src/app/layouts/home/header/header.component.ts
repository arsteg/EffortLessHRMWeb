import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '../../../_services/user-preference.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);
  @Output() onMenuToggled = new EventEmitter<boolean>();
  @Output() onProfileSwitch = new EventEmitter<string>();
  @Input() loggedInUser: any;
  @Input() profileSwitch: any;
  @Input() role: any;

  constructor(private preferenceService: PreferenceService) {}

  toggleMenu(){
    this.onMenuToggled.emit();
  }

  switchView(view:string){
    this.onProfileSwitch.emit(view);
    const selectedAppMode = view?.toLowerCase() === 'admin' ? 'admin' : 'user';
    this.preferenceService.createOrUpdatePreference(
      this.loggedInUser._id,
      'AppMode',
      selectedAppMode
    ).subscribe({
      next: () => console.log('AppMode updated successfully'),
      error: (err) => console.error('Error updating AppMode:', err)
    });
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
