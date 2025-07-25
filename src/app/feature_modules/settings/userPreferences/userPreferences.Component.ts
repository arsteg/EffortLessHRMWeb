import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreferenceOption, UserPreference, PreferenceService, UserPreferenceStructure } from 'src/app/_services/user-preference.service';
import { map, Observable } from 'rxjs';
import { UserService } from 'src/app/_services/users.service';
import { ToastrService } from 'ngx-toastr';
import { PreferenceKeys } from 'src/app/constants/preference-keys.constant';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
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
          this.preferenceService.getPreferenceByKey(PreferenceKeys.SettingsUserSettingsSelectedMember, this.userId?.id)
          .subscribe({
            next: (response: any) => {
              const preferences = response?.data?.preferences || [];
              const match = preferences.find((pref: any) =>
                pref?.preferenceOptionId?.preferenceKey === PreferenceKeys.SettingsUserSettingsSelectedMember
              );
              this.selectedUsersByAdmin = match?.preferenceOptionId?.preferenceValue || ''; 
              this.loadUserPreferences(this.selectedUsersByAdmin);
            },
            error: (err) => {
              console.error('Failed to load language preference', err);
              this.selectedUsersByAdmin = this.userList[0]._id;
              this.loadUserPreferences(this.selectedUsersByAdmin);
            }
          });
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
    

    //Set selected user as preferences
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.preferenceService.createOrUpdatePreference(
      currentUser.id,
      PreferenceKeys.SettingsUserSettingsSelectedMember,
      userId
    ).subscribe();
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
          (pref.metadata?.inputType === 'checkbox' ? this.userPreferences[pref.key] || 'false'
          : (pref.metadata?.inputType === 'number'? this.userPreferences[pref.key] || '0' : ''))
        )
      );

      Promise.all(updateRequests.map(req => req.toPromise())).then(
        () => {
          this.toastr.success(this.translate.instant('preferences.updateSuccess'));
        },
        (error) => {
          this.toastr.error(this.translate.instant('preferences.updateError'), error);
        }
      );
    });
  }
}
