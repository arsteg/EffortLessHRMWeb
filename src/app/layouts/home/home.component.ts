import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit } from 'ng-http-loader';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDialog } from '@angular/material/dialog';
import { SideBarAdminMenu, SideBarUserMenu } from './menu.const';
import { MatMenuTrigger } from '@angular/material/menu';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild(MatMenuTrigger) profileMenu!: MatMenuTrigger;
  title = 'sideBarNav';
  isCollapsedMenu: boolean = false;
  menuList: any = SideBarUserMenu;
  spinnerStyle = Spinkit;
  portalType: string = 'user';
  adminView: string = 'admin';
  currentProfile: any;
  dropdownOpen: boolean = false;
  selectedOption: string;
  options: string[] = [
    'You spent the 7 connects on the availability',
    'The work week has ended, and your weekly summary is available for summary',
    'Your Proposal to job',
  ];
  sideBarMenu = SideBarAdminMenu;

  isEdit: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthenticationService,
    private commonService: CommonService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    let role = localStorage.getItem('role');
    this.adminView = localStorage.getItem('adminView');
    // this.auth.getRole(roleId).subscribe((response: any) => {
    // let role = response && response.data && response.data[0].RoleName;
    this.commonService.setCurrentUserRole(role);
    console.log(role);
    console.log(this.adminView);
    if (this.adminView) {
      if (this.adminView?.toLowerCase() == 'admin') {
        this.adminView = 'admin';
        localStorage.setItem('adminView', 'admin');
        this.menuList = SideBarAdminMenu;
        this.portalType = this.adminView?.toLowerCase();
        console.log(this.portalType);
      }
      if (this.adminView?.toLowerCase() == 'user') {
        this.adminView = 'user';
        this.menuList = SideBarUserMenu;
        localStorage.setItem('adminView', 'user');
      }
    } else {
      if (role && role?.toLowerCase() == 'admin') {
        this.menuList = SideBarAdminMenu;
        this.portalType = role?.toLowerCase();
        console.log(this.portalType)
      }
      if (role && role?.toLowerCase() == 'user') {
        this.menuList = SideBarUserMenu;
      }
      this.adminView = role?.toLowerCase();
    }
    // this.portalType = roleId && roleId?.toLowerCase();
    // console.log(this.portalType)
    // });

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      this.commonService.setCurrentUser(this.currentProfile);
      return this.currentProfile;
    });
  }

  toggleDropdown() {
    this.dropdownOpen = this.dropdownOpen == false ? true : false;
  }

  switchView(view: string) {
    this.adminView = view;
    localStorage.setItem('adminView', view);
    if (view == 'user') {
      this.menuList = SideBarUserMenu;
      this.router.navigateByUrl('home/dashboard/user');
    } else if (view == 'admin') {
      this.menuList = SideBarAdminMenu;
      this.router.navigateByUrl('home/dashboard');
    }
  }

  onLogout() {
    localStorage.removeItem('role');
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
