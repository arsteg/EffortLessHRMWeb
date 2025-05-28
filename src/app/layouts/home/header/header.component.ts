import { Component, EventEmitter, Output, Input, inject, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '../../../_services/user-preference.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PreferenceKeys } from 'src/app/constants/preference-keys.constant';

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
  profileImageUrl: string;
  isMenuCollapsed: boolean = false;

  constructor(private preferenceService: PreferenceService,
    private auth: AuthenticationService,
  ) { }

  @ViewChild('fileInput') fileInput: ElementRef;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loggedInUser'] && this.loggedInUser?._id) {
      this.loadMenuPreference();
    }
  }
    
  private loadMenuPreference() {
  this.preferenceService.getPreferenceByKey(PreferenceKeys.MenuCollapseOrExpand, this.loggedInUser._id)
    .subscribe({
      next: (response: any) => {
        const preferences = response?.data?.preferences || [];
        const match = preferences.find((pref: any) =>
          pref?.preferenceOptionId?.preferenceKey === PreferenceKeys.MenuCollapseOrExpand
        );
        if (match?.preferenceOptionId?.preferenceValue === 'collapsed') {
          this.isMenuCollapsed = true;
          this.onMenuToggled.emit(true); // Emit to update layout
        } else {
          this.isMenuCollapsed = false;
          this.onMenuToggled.emit(false);
        }
      },
      error: (err) => {
        console.error('Failed to load menu preference', err);
        this.isMenuCollapsed = false;
        this.onMenuToggled.emit(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // Get base64 without prefix
        const extension = file.name.split('.').pop()?.toLowerCase();
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        const payload = {
          profileImage: [
            {
              attachmentSize: file.size,
              extention: extension,
              file: base64String // base64 string of the file
            }
          ]
        };

        // Optionally set image preview
        this.profileImageUrl = reader.result as string;

        // Upload to backend
        this.preferenceService.uploadProfileImage(currentUser?.id, payload).subscribe({
          next: (response) => {
            this.auth.GetMe(currentUser.id).subscribe((response: any) => {
              this.loggedInUser = response && response.data.users;
            });
          },
          error: (error) => {
            console.error('Upload failed:', error);
          }
        });
      };

      reader.readAsDataURL(file); // Trigger FileReader
    }
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this.onMenuToggled.emit(this.isMenuCollapsed);

    const menuState = this.isMenuCollapsed ? 'collapsed' : 'expanded';
    this.preferenceService.createOrUpdatePreference(
      this.loggedInUser._id,
      PreferenceKeys.MenuCollapseOrExpand,
      menuState
    ).subscribe({
      next: () => console.log(`Menu state updated to ${menuState}`),
      error: (err) => console.error('Error updating menu state:', err)
    });
  }

  switchView(view: string) {
    this.onProfileSwitch.emit(view);
    const selectedAppMode = view?.toLowerCase() === 'admin' ? 'admin' : 'user';
    this.preferenceService.createOrUpdatePreference(
      this.loggedInUser._id,
      PreferenceKeys.AppMode,
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
