import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Preference, preferenceCategory, userPreference } from 'src/app/models/settings/userPreferences/userPreferences';
import { SettingsService } from 'src/app/_services/settings.service';
import { first } from 'rxjs';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './userPreferences.Component.html',
  styleUrls: ['./userPreferences.Component.css']
})
export class UserPreferencesComponent implements OnInit {
  preferenceCategories: preferenceCategory[];
  userPreferences: userPreference[];
  selectedCategory: preferenceCategory=null;
  categoriesData: any=[];
  currentUser:User;
  formValid: boolean = false;
  constructor(private http: HttpClient, private settingsService:SettingsService) {
   }

  ngOnInit(): void {
  this.loadCategories();
  this.currentUser= JSON.parse(localStorage.getItem('currentUser'));
  }

  loadCategories(){
    this.settingsService.getPreferenCategories().pipe(first()).subscribe((res: any) => {
                this.preferenceCategories = res.data;
    },
      err => {
      });
  }

  OnCategoryChange(event: MatTabChangeEvent){
    this.selectedCategory = this.preferenceCategories[event.index];
    this.userPreferences=[];
    this.settingsService.getUserPreference(this.selectedCategory._id).pipe(first()).subscribe((res: any) => {
      this.userPreferences = res.data;
},
err => {
});



  }

  onSubmit() {
    // Check form validity before submitting
    if (this.formValid) {
      this.updateUserPreferences();
    } else {
      console.log('Form is invalid.');
    }
  }

  updateUserPreferences(){
    if(this.userPreferences && this.userPreferences.length>0){
      this.userPreferences.forEach((p)=>{
        const pref:Preference = {user:this.currentUser.id ,preference:p.preference, preferenceValue:p.preferenceValue  }
        this.settingsService.updateUserPreference(p.Id,pref).pipe(first()).subscribe((res: any) => {
          console.log(res);
        },
    err => {
    });
      })
    }
  }

  updateValue(eventtype: any, key: string, fieldname: string, categoryName: string) {
    const checked = eventtype.target.checked;
  }

  updateFormValidityBool(event: any){
    this.userPreferences?.forEach(option =>
      {
        if(option.name == event.target.name){
          option.preferenceValue = event.target.checked ? 'true' : 'false';
        }
      }
    );

    this.formValid = this.userPreferences?.every(option =>
      this.validateOption(option)
    );
  }
  updateFormValidity() {
    this.formValid = this.userPreferences?.every(option =>
      this.validateOption(option)
    );
  }
  validateOption(option: userPreference): boolean {
    if (option.dataType === 'string' || option.dataType === 'number') {
      // Implement your validation logic here
      // Example: Return false if the value is empty
      return option.preferenceValue !== '';
    } else if (option.dataType === 'boolean') {
      // No specific validation needed for boolean options
      return true;
    } else if (option.dataType === 'date') {
      // Implement your validation logic for date
      // Example: Return false if the date is not valid
      return this.isValidDate(option.preferenceValue);
    }
    // ... Implement similar logic for other data types ...
    return true;
  }

  isValidDate(date: any): boolean {
    if (typeof date !== 'string') {
      return false; // Invalid if not a string
    }

    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()); // Returns true if the date is valid
  }
}
