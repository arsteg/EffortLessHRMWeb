import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {

  showGeneralSettings: boolean = true;
  showManagePasswordSettings: boolean = true;
  public sortOrder: string = ''; // 'asc' or 'desc'
  activeButton: string = 'General';

  constructor() { }

  ngOnInit(): void {
    this.toggleGeneralSettings();
  }

  toggleGeneralSettings() {
    this.showGeneralSettings = true;
    this.showManagePasswordSettings = false;
    this.activeButton = 'General';
  }
  toggleManagePasswordSettings() {
    this.showGeneralSettings = false;
    this.showManagePasswordSettings = true;
    this.activeButton = 'ManagePassword';
  }

}
