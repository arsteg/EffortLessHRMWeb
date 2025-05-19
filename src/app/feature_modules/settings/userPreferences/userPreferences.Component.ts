import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreferenceOption, UserPreference, PreferenceService, UserPreferenceStructure } from 'src/app/_services/user-preference.service';
import { map, Observable } from 'rxjs';
import { UserService } from 'src/app/_services/users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './userPreferences.Component.html',
  styleUrls: ['./userPreferences.Component.css']
})
export class UserPreferencesComponent implements OnInit {
  formValid: boolean = true;
  userId: any;
  explicitPreferences: Observable<UserPreferenceStructure[]>;
  userPreferences: { [key: string]: string } = {};
  isLoading: Observable<boolean>;
  view = localStorage.getItem('adminView');
  userList: any[] = [];
  selectedUsersByAdmin: string = '';
  
  constructor(private http: HttpClient, 
    private preferenceService: PreferenceService, 
    private userService: UserService,
    private toastr: ToastrService) {
      this.explicitPreferences = this.preferenceService.getExplicitPreferenceStructure();
      this.isLoading = this.preferenceService.isLoading;
  }

  ngOnInit(): void {
    this.userId= JSON.parse(localStorage.getItem('currentUser'));
    this.userService.getUserList().subscribe({
      next: (response) => {
        this.userList = response?.data?.data || [];
        if (this.view === 'admin' && this.userList.length > 0) {
          this.selectedUsersByAdmin = this.userList[0]._id;
          this.loadUserPreferences(this.selectedUsersByAdmin);
        } else {
          this.loadUserPreferences(this.userId.id);
        }
      },
      error: (error) => {
        console.error('Failed to load user list:', error)
      }
    });
    this.explicitPreferences = this.preferenceService.getExplicitPreferenceStructure().pipe(
      map(preferences => {
      if (this.view == 'admin') {
        return preferences.filter(pref => pref.metadata?.setbyadmin === true);
      }
      return preferences.filter(pref => pref.metadata?.setbyadmin === false);
    })
  );
    this.isLoading = this.preferenceService.isLoading;
  }

  // Load preferences
  loadUserPreferences(userId: any): void {
    this.userPreferences = {};
      this.preferenceService.getPreferencesByUserId(userId).subscribe({
      next: (response) => {
        this.explicitPreferences.subscribe(explicitPrefs => {
          const explicitKeys = new Set(explicitPrefs.map(p => p.key));
          const preferences = response.data?.preferences || [];
          preferences.forEach((pref: any) => {
            if (pref.preferenceOptionId && typeof pref.preferenceOptionId !== 'string') {
              const option = pref.preferenceOptionId as PreferenceOption;
              if (explicitKeys.has(option.preferenceKey)) {
                this.userPreferences[option.preferenceKey] = option.preferenceValue;
              }
            }
          });
        });
      },
      error: (error) => console.error('Failed to load user preferences:', error)
    });
  }

  // Update form validity
  updateFormValidity(): void {
        this.formValid = true;
    }

    onSubmit(): void {
    if (!this.formValid) return;

    this.explicitPreferences.subscribe(explicitPrefs => {
      const updateRequests = explicitPrefs.map(pref =>
        this.preferenceService.createOrUpdatePreference(
          this.view.toLowerCase() === 'admin'? this.selectedUsersByAdmin : this.userId.id,
          pref.key,
          this.userPreferences[pref.key] || 'false'
        )
      );

      Promise.all(updateRequests.map(req => req.toPromise())).then(
        () => {
          this.toastr.success('Preferences updated successfully');
        },
        (error) => {
          this.toastr.error(`Failed to update preferences: ${error}`);
        }
      );
    });
  }
}
