import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit } from 'ng-http-loader';
import { AuthenticationService } from '../_services/authentication.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDialog } from '@angular/material/dialog';
import { AddTimeEntryComponent } from './add-time-entry/add-time-entry.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  title = 'sideBarNav';
  isCollapsedMenu: boolean = false;
  menuList: any = SideBarUserMenu;
  spinnerStyle = Spinkit;
  portalType: string = 'user';
  adminView: string = 'admin';
  currentProfile: any;
  dropdownOpen: boolean = false;
  selectedOption: string;
  searchText: string = ''
  options: string[] = ['You spent the 7 connects on the availability',
    'The work week has ended, and your weekly summary is available for summary',
    'Your Proposal to job'];
  sideBarMenu = SideBarAdminMenu;

  constructor(private router: Router,
    private auth: AuthenticationService,
    private commonService: CommonService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.showSidebar();

    let roleId = localStorage.getItem('roleId');
    this.adminView = localStorage.getItem('adminView');
    this.auth.getRole(roleId).subscribe((response: any) => {
      let role = response && response.data && response.data[0].Name;

      this.commonService.setCurrentUserRole(role);
      if (this.adminView) {
        if (this.adminView?.toLowerCase() == 'admin') {
          this.adminView = 'admin'
          localStorage.setItem('adminView', 'admin');
          this.menuList = SideBarAdminMenu;
          this.portalType = this.adminView?.toLowerCase();
        }
        if (this.adminView?.toLowerCase() == 'user') {
          this.adminView = 'user'
          this.menuList = SideBarUserMenu;
          localStorage.setItem('adminView', 'user');
        }
      }
      else {
        if (role && role?.toLowerCase() == 'admin') {
          this.menuList = SideBarAdminMenu;
          this.portalType = role?.toLowerCase()
        }
        if (role && role?.toLowerCase() == 'user') {
          this.menuList = SideBarUserMenu;
        }
        this.adminView = role?.toLowerCase();
      }
      this.portalType = role && role?.toLowerCase();
    });

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      this.commonService.setCurrentUser(this.currentProfile);
      return this.currentProfile;
    })
    console.log(this.adminView)
  }

  toggleDropdown() {
    this.dropdownOpen = this.dropdownOpen == false ? true : false
  }

  switchView(view: string) {
    this.adminView = view;
    localStorage.setItem('adminView', view);
    if (view == 'user') {
      this.menuList = SideBarUserMenu;
      this.router.navigate(['userDashboard'])
    }
    else if (view == 'admin') {
      this.menuList = SideBarAdminMenu;
      this.router.navigate(['dashboard'])
    }
    this.collapseSidebar();  // Automatically collapse the sidebar
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
    this.router.navigateByUrl('/login')
  }

  clickMenu(id: string) {
    this.menuList.forEach(element => {
      if (element.id == id) {
        element.show = !element.show;
      }
    });
    this.collapseSidebar();  // Automatically collapse the sidebar
  }

  clickEvent() {
    this.isCollapsedMenu = !this.isCollapsedMenu;
    localStorage.setItem('sidebar', JSON.stringify(this.isCollapsedMenu))
  }

  showSidebar() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 992) {
      this.isCollapsedMenu = true; // Hide sidebar by default on mobile and tablet
    } else {
      this.isCollapsedMenu = false; // Show sidebar on desktop
    }
    localStorage.setItem('sidebar', JSON.stringify(this.isCollapsedMenu));
  }

  collapseSidebar() {
    if (window.innerWidth <= 992) {
      this.isCollapsedMenu = true;  // Collapse the sidebar
    } else {
      this.isCollapsedMenu = false; // Show sidebar on desktop
    }
    localStorage.setItem('sidebar', JSON.stringify(this.isCollapsedMenu));
  }

  filteredMenuItems() {
    const searchTerm = this.searchText.trim().toLowerCase();
    if (searchTerm === '') {
      this.menuList = SideBarAdminMenu;
    } else {
      const filtered = SideBarAdminMenu.filter(item =>
        item.title.toLowerCase().includes(searchTerm)
      );
      console.log('filteredMenuItems:', filtered);
      this.menuList = filtered;
    }

    if (this.searchText === '') {
      this.menuList = SideBarAdminMenu;
    }
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddTimeEntryComponent, {
      width: '700px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }
}

export const SideBarAdminMenu = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'assets/Sidenav-Icons/dashboard.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/dashboard.png',
    url: '/dashboard',
  },
  {
    id: '2',
    title: 'Screenshots',
    icon: 'assets/Sidenav-Icons/screenshots.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/screenshots.png',
    url: '/screenshots',
  },
  {
    id: '19',
    icon: 'assets/Sidenav-Icons/livescreen.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/liveScreen.png',
    title: 'View Live Screen',
    url: '/viewLiveScreen'
  },
  {
    id: '3',
    title: 'RealTime',
    icon: 'assets/Sidenav-Icons/realtime.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/realtime.png',
    url: '/realtime'
  },
  {
    id: '4',
    title: 'Organization',
    icon: 'assets/Sidenav-Icons/organization.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/organization.png',
    url: '/organization'


  },
  {
    id: '5',
    title: 'Manage',
    icon: 'assets/Sidenav-Icons/manage.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/manage.png',
    url: '/manage/employees'

  },
  {
    id: '6',
    title: 'Calendar',
    icon: 'assets/Sidenav-Icons/calendar.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/calendar.png',
    url: '/AdminCalendar'
  },
  {
    id: '7',
    title: 'Attendance',
    icon: 'assets/Sidenav-Icons/attendance.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/attendance.png',
    url: 'attendance'

  },
  {
    id: '8',
    title: 'Timesheets',
    icon: 'assets/Sidenav-Icons/timesheet.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/timesheet.png',
    url: 'timesheet'

  },
  {
    id: '9',
    title: 'Leave',
    icon: 'assets/Sidenav-Icons/leave.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/leave.png',
    url: 'Leave'

  },
  {
    id: '10',
    title: 'Expenses',
    icon: 'assets/Sidenav-Icons/expenses.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/expenses.png',
    url: 'expenses'
  },
  {
    id: '11',
    title: 'Alerts',
    icon: 'assets/Sidenav-Icons/alert.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/alerts.png',
    url: 'alerts'
  },
  {
    id: '12',
    title: 'Payroll',
    icon: 'assets/Sidenav-Icons/payroll.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/payroll.png',
    url: '/payroll/settings'
  },
  {
    id: '13',
    title: 'Taxation',
    icon: 'assets/Sidenav-Icons/taxation.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/taxation.png',
    url: 'taxation'
  },
  {
    id: '14',
    title: 'Reports',
    icon: 'assets/Sidenav-Icons/reports.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/reports.png',
    url: 'reports'
  },
  {
    id: '15',
    title: 'Separation',
    icon: 'assets/Sidenav-Icons/separation.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/separation.png',
    url: 'separation'
  },
  {
    id: '16',
    title: 'Settings',
    icon: 'assets/Sidenav-Icons/settings.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/settings.png',
    url: 'settings'
  },
  {
    id: '17',
    icon: 'assets/Sidenav-Icons/permission.png',
    title: 'Permissions',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/permission.png',
    url: '/permissions'

  },
  {
    id: '17',
    icon: 'assets/Sidenav-Icons/roles.png',
    title: 'Roles',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/roles.png',
    url: '/roles'
  },
  {
    id: '18',
    icon: 'assets/Sidenav-Icons/rolePermission.png',
    title: 'Role Permission',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/rolePermission.png',
    url: '/rolePermission'
  },
  {
    id: '19',
    icon: 'assets/Sidenav-Icons/approvals.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/approval.png',
    title: 'Approvals',
    url: 'Approvals'
  },
  {
    id: '20',
    title: 'Interview Process',
    icon: 'assets/Sidenav-Icons/settings.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/settings.png',
    url: '/interviewProcess'
  }
];

export const SideBarUserMenu = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'assets/Sidenav-Icons/dashboard.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/dashboard.png',
    url: '/userDashboard',

  },
  {
    id: '2',
    title: 'Screenshots',
    icon: 'assets/Sidenav-Icons/screenshots.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/screenshots.png',
    url: '/screenshots',

  },
  {
    id: '17',
    title: 'View Live Screen',
    icon: 'assets/Sidenav-Icons/livescreen.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/liveScreen.png',
    url: '/viewLiveScreen'
  },
  {
    id: '3',
    title: 'RealTime',
    icon: 'assets/Sidenav-Icons/realtime.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/realtime.png',
    url: '/realtime'

  },

  {
    id: '17',
    title: 'Tasks',
    icon: 'assets/Sidenav-Icons/tasks.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/tasks.png',
    url: 'tasks'
  },

  {
    id: '4',
    title: 'Alerts',
    icon: 'assets/Sidenav-Icons/alert.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/alerts.png',
  },
  {
    id: '5',
    title: 'Organization',
    icon: 'assets/Sidenav-Icons/organization.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/organization.png',
    url: 'organization'

  },
  {
    id: '6',
    title: 'Calendar',
    icon: 'assets/Sidenav-Icons/calendar.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/calendar.png',
    url: '/UserCalendar'
  },
  {
    id: '7',
    title: 'Leave',
    icon: 'assets/Sidenav-Icons/leave.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/leave.png',
    url: 'Leave'
  },
  {
    id: '8',
    title: 'Attendance',
    icon: 'assets/Sidenav-Icons/attendance.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/attendance.png',
    url: 'attendance'
  },
  {
    id: '9',
    title: 'Timesheets',
    icon: 'assets/Sidenav-Icons/timesheet.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/timesheet.png',
    url: 'userTimesheet'
  },
  {
    id: '10',
    title: 'Taxation',
    icon: 'assets/Sidenav-Icons/taxation.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/taxation.png',
    url: 'taxDeclaration'

  },
  {
    id: '11',
    title: 'Expenses',
    icon: 'assets/Sidenav-Icons/expenses.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/expenses.png',
    url: 'expenses'
  },
  {
    id: '12',
    title: 'PaySlips',
    icon: 'assets/Sidenav-Icons/payslip.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/payslip.png',
  },
  {
    id: '13',
    title: 'Separation',
    icon: 'assets/Sidenav-Icons/separation.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/separation.png',
    url: 'separation'

  },
  {
    id: '14',
    title: 'Reports',
    icon: 'assets/Sidenav-Icons/reports.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/reports.png',
    url: 'reports'
  },
  {
    id: '15',
    title: 'Manual Time',
    icon: 'assets/Sidenav-Icons/manualTime.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/manualTime.png',
    url: 'requestManualTime'
  },
  {
    id: '16',
    title: 'Settings',
    icon: 'assets/Sidenav-Icons/settings.png',
    lightIcon: 'assets/Sidenav-Icons/light-Icons/settings.png',
    url: '/userPreferences'
  }
];


