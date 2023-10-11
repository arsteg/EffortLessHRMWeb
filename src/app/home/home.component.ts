import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit } from 'ng-http-loader';
import { AuthenticationService } from '../_services/authentication.service';
import { CommonService } from '../common/common.service';


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

  constructor(private router: Router, private auth: AuthenticationService, private commonService: CommonService) 
  {
   }

  ngOnInit(): void {
    let roleId = localStorage.getItem('roleId');
    this.adminView = localStorage.getItem('adminView');
    this.auth.getRole(roleId).subscribe((response: any) => {
      let role = response && response.data && response.data[0].Name;

      this.commonService.setCurrentUserRole(role);
      if (this.adminView) {
        if (this.adminView?.toLowerCase() == 'admin') {
          this.menuList = SideBarAdminMenu;
          this.portalType = this.adminView?.toLowerCase();
        }
        if (this.adminView?.toLowerCase() == 'user') {
          this.menuList = SideBarUserMenu;
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

  }
  clickEvent() {
    this.isCollapsedMenu = !this.isCollapsedMenu;
    localStorage.setItem('sidebar', JSON.stringify(this.isCollapsedMenu))
  }
 
  filteredMenuItems() {
    console.log('searchTerm:', this.searchText);
    
    const searchTerm = this.searchText.trim().toLowerCase(); // Trim and convert to lowercase
    if (searchTerm === '') {
      // If search term is empty, display all menu items
      this.menuList = SideBarAdminMenu; // Reset to original unfiltered menuList
    } else {
      const filtered = SideBarAdminMenu.filter(item =>
        item.title.toLowerCase().includes(searchTerm)
      );
      console.log('filteredMenuItems:', filtered);
      this.menuList = filtered; // Update menuList with filtered items
    }
    
    // Check if the search text was deleted completely, and if so, reset it to display all items
    if (this.searchText === '') {
      this.menuList = SideBarAdminMenu; // Reset to original unfiltered menuList
    }
  }
  
  

}

export const SideBarAdminMenu = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'fa fa-chart-bar',
    url: '/dashboard',
  },
  {
    id: '2',
    title: 'Screenshots',
    icon: 'fa fa-camera',
    url: '/screenshots',
  },
  {
    id: '19',
    icon: 'fa fa-video',
    title: 'View Live Screen',
    url: '/viewLiveScreen'
  },
  {
    id: '3',
    title: 'RealTime',
    icon: 'fa fa-clock',
    url: '/realtime'
  },
  {
    id: '4',
    title: 'Organization',
    icon: 'fa fa-building',
    url: '/organization'
    // subMenu: [
    //   {
    //     id: '41',
    //     title: 'Organization Setup',
    //   },
    //   {
    //     id: '42',
    //     title: 'Employee Fields',
    //   },
    //   {
    //     id: '43',
    //     title: 'Employee Tree',
    //   },
    //   {
    //     id: '44',
    //     title: 'Documents',
    //     url:'/documentManager'
    //   },
    //   {
    //     id: '45',
    //     title: 'Assets Management',
    //     url: '/assetsManagement'
    //   }
    // ],
  },
  {
    id: '5',
    title: 'Manage',
    icon: 'fa fa-database',
    url: '/manage'
    // subMenu: [
    //   {
    //     id: '51',
    //     title: 'Employees',
    //     url: 'employees'
    //   },
    //   {
    //     id: '53',
    //     title: 'Projects',
    //     url: 'project',
    //   },
    //   {
    //     id: '54',
    //     title: 'Tasks',
    //     url: 'tasks'
    //   },
    //   {
    //     id: '55',
    //     title: 'Manual Time',
    //     url: '/requestManualTime'
    //   },
    //   {
    //     id: '56',
    //     title: 'Team Members',
    //     url: 'teamMembers'
    //   },
    //   {
    //     id: '57',
    //     title: 'Tags',
    //     url: 'tags'
    //   },
    //   {
    //     id: '58',
    //     title: 'Email Template',
    //     url: '/emailtemplate'
    //   }
    // ]
  },
  {
    id: '6',
    title: 'Calendar',
    icon: 'fa fa-calendar-alt',
    url: '/AdminCalendar'
  },
  {
    id: '7',
    title: 'Attendance',
    icon: 'fa fa-check-square',
    url: 'attendance'

  },
  {
    id: '8',
    title: 'Timesheets',
    icon: 'fa fa-clock',
    url: 'timesheet'

  },
  {
    id: '9',
    title: 'Leave',
    icon: 'fas fa-walking',
    url: 'Leave'

  },
  {
    id: '10',
    title: 'Expenses',
    icon: 'fa fa-money-bill',
    url: 'expenses'
  },
  {
    id: '11',
    title: 'Alerts',
    icon: 'fa fa-bell',
    url: 'alerts'
  },
  {
    id: '12',
    title: 'Payroll',
    icon: 'fa fa-id-card',
    url: 'payroll'
  },
  {
    id: '13',
    title: 'Taxation',
    icon: 'fa fa-dollar-sign',
    url: 'taxation'
  },
  {
    id: '14',
    title: 'Reports',
    icon: 'fa fa-chart-line',
    url: 'reports'
  },
  {
    id: '15',
    title: 'Separation',
    icon: 'fas fa-divide',
    url: 'separation'
  },
  {
    id: '16',
    title: 'Settings',
    icon: 'fa fa-wrench',
    url: 'settings'
  },
  {
    id: '17',
    icon: 'fa fa-lock',
    title: 'Permissions',
    url: '/permissions'

  },
  {
    id: '17',
    icon: 'fa fa-universal-access',
    title: 'Roles',
    url: '/roles'
  },
  {
    id: '18',
    icon: 'fa  fa-id-badge',
    title: 'Role Permission',
    url: '/rolePermission'
  },
  {
    id: '19',
    icon: 'fa  fa-id-badge',
    title: 'Approvals',
    url: 'Approvals'
  }
];

export const SideBarUserMenu = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'fa fa-chart-bar',
    url: '/userDashboard',

  },
  {
    id: '2',
    title: 'Screenshots',
    icon: 'fa fa-camera',
    url: '/screenshots',

  },
  {
    id: '17',
    title: 'View Live Screen',
    icon: 'fa fa-video',
    url: '/viewLiveScreen'
  },
  {
    id: '3',
    title: 'RealTime',
    icon: 'fa fa-clock',
    url: '/realtime'

  },

  {
    id: '17',
    title: 'Tasks',
    icon: 'fa fa-list',
    url: 'tasks'
  },

  {
    id: '4',
    title: 'Alerts',
    icon: 'fa fa-bell'
  },
  {
    id: '5',
    title: 'Organization',
    icon: 'fa fa-building',
    url: 'organization'
    // subMenu: [
    //   {
    //     id: '51',
    //     title: 'Company Policies',
    //   },
    //   {
    //     id: '52',
    //     title: 'Organization Tree',
    //   },
    //   {
    //     id: '53',
    //     title: 'Employee Tree',
    //   },
    //   {
    //     id: '54',
    //     title: 'Assets',
    //     url: '/Assets'
    //   }
    // ]
  },
  {
    id: '6',
    title: 'Calendar',
    icon: 'fa fa-calendar-alt',
    url: '/UserCalendar'
  },
  {
    id: '7',
    title: 'Leave',
    icon: 'fas fa-walking',
    url: 'Leave'
  },
  {
    id: '8',
    title: 'Attendance',
    icon: 'fa fa-check-square',
    url: 'attendance'
  },
  {
    id: '9',
    title: 'Timesheets',
    icon: 'fa fa-clock',
    url: 'userTimesheet'
  },
  {
    id: '10',
    title: 'Taxation',
    icon: 'fa fa-dollar-sign',
    url: 'taxDeclaration'
    
  },
  {
    id: '11',
    title: 'Expenses',
    icon: 'fa fa-money-bill',
    url: 'expenses'
  },
  {
    id: '12',
    title: 'PaySlips',
    icon: 'fa fa-envelope-open'
  },
  {
    id: '13',
    title: 'Separation',
    icon: 'fas fa-divide',
    url: 'separation'
    
  },
  {
    id: '14',
    title: 'Reports',
    icon: 'fa fa-chart-line',
    url: 'reports'
  },
  {
    id: '15',
    title: 'Manual Time',
    icon: 'bi bi-clock-history',
    url: 'requestManualTime'
  },
  {
    id: '16',
    title: 'Settings',
    icon: 'fa fa-wrench',
    url: '/userPreferences'
    
  }

];


