import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit } from 'ng-http-loader';
import { AuthenticationService } from '../_services/authentication.service';


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
  // guestView: string = 'guest';
  currentProfile: any;
  constructor(private router: Router, private auth: AuthenticationService) { }

  ngOnInit(): void {
    let roleId = localStorage.getItem('roleId');
    this.auth.getRole(roleId).subscribe((response: any) => {
      let role = response && response.data && response.data[0].Name;
      if (role.toLowerCase() == 'user') {
        this.menuList = SideBarUserMenu;
        this.portalType = "user";
      }
      if (role.toLowerCase() == 'admin') {
        this.menuList = SideBarAdminMenu;
        this.portalType = "admin"
      }
      // if (role.toLowerCase() == 'user') {
      //   this.menuList = SideBarUserMenu;
      //   this.portalType = "guest";
      // }

    });

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      return this.currentProfile;
    })
  }

  switchView(view: string) {
    this.adminView = view;
    localStorage.setItem('roleId', this.adminView);
    if (view == 'user') {
     this.menuList = SideBarUserMenu;
    }
    else if (view == 'admin') {
    this.menuList = SideBarAdminMenu;
    }
    this.router.navigate(['dashboard'])
  }

  // guestview(view: string){
  //   this.guestView = view;
  //   if (view == 'guest') {
  //     this.menuList = SideBarUserMenu;
  //   }
  //   this.router.navigate(['dashboard'])
  // }

  onLogout() {
    localStorage.removeItem('user.email')
    this.router.navigateByUrl('/main')
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
    id: '3',
    title: 'RealTime',
    icon: 'fa fa-clock',
  },
  {
    id: '4',
    title: 'Organization',
    icon: 'fa fa-building',
    subMenu: [
      {
        id: '41',
        title: 'Organization Setup',
      },
      {
        id: '42',
        title: 'Employee Fields',
      },
      {
        id: '43',
        title: 'Employee Tree',
      },
      {
        id: '44',
        title: 'Documents',
      },
      {
        id: '45',
        title: 'Assets Management',
      },
      {
        id: '46',
        title: 'Access Management',
      }
    ],
  },
  {
    id: '5',
    title: 'Manage',
    icon: 'fa fa-database',
    subMenu: [
      {
        id: '51',
        title: 'Employees',
        url: 'employees'
      },
      {
        id: '53',
        title: 'Projects',
        url: 'project',
      },
      {
        id: '54',
        title: 'Tasks',
        url: 'tasks'
      },
      {
        id: '55',
        title: 'Manual Time',
      },
      {
        id: '56',
        title: 'Team Members',
        url: 'teamMembers'
      }

    ]
  },
  {
    id: '6',
    title: 'Calendar',
    icon: 'fa fa-calendar-alt',
  },
  {
    id: '7',
    title: 'Attendance',
    icon: 'fa fa-check-square',
    subMenu: [
      {
        id: '81',
        title: 'Settings',
      },
      {
        id: '82',
        title: 'Attendance Records',
      },
      {
        id: '83',
        title: 'Roaster Records',
      },
      {
        id: '84',
        title: 'Regularization Requests',
      },
      {
        id: '84',
        title: 'OnDuty Requests',
      },
      {
        id: '84',
        title: 'Attendance Audit',
      },
      {
        id: '84',
        title: 'Attendance Process',
      },
      {
        id: '84',
        title: 'Attendance Reconciliation',
      },
      {
        id: '84',
        title: 'Biometric Logs',
      },
      {
        id: '84',
        title: 'Biometric Reconciliation',
      }
    ]
  },
  {
    id: '8',
    title: 'Timesheets',
    icon: 'fa fa-clock',
    subMenu: [
      {
        id: '81',
        title: 'Settings',
      },
      {
        id: '82',
        title: 'Projects',
      },
      {
        id: '83',
        title: 'Timesheets',

      },
      {
        id: '84',
        title: 'Time Approvals',
      }
    ]
  },
  {
    id: '9',
    title: 'Leave',
    icon: 'fas fa-walking',
    subMenu: [
      {
        id: '91',
        title: 'Settings',
      },
      {
        id: '92',
        title: 'Leave Grant',
      },
      {
        id: '93',
        title: 'Leave Balance',
      },
      {
        id: '94',
        title: 'Leave Application',
      },
      {
        id: '95',
        title: 'Short Leave',
      }
    ]
  },
  {
    id: '10',
    title: 'Expenses',
    icon: 'fa fa-money-bill',
    subMenu: [
      {
        id: '101',
        title: 'Settings',
      },
      {
        id: '102',
        title: 'Expense Reports',
      },
      {
        id: '103',
        title: 'Advanced Reports',
      }
    ]
  },
  {
    id: '11',
    title: 'Alerts',
    icon: 'fa fa-bell',
    subMenu: [
      {
        id: '111',
        title: 'Setup Issues',
      },
      {
        id: '112',
        title: 'Pending Reports',
      }
    ]
  },
  {
    id: '12',
    title: 'Payroll',
    icon: 'fa fa-id-card',
    subMenu: [
      {
        id: '121',
        title: 'Settings',
      },
      {
        id: '122',
        title: 'CTC Template',
      },
      {
        id: '123',
        title: 'LOP Reversal',
      },
      {
        id: '124',
        title: 'Run Pyroll',
      },
      {
        id: '125',
        title: 'Full and Final',
      },
      {
        id: '126',
        title: 'Payslips',
      }
    ]
  },
  {
    id: '13',
    title: 'Taxation',
    icon: 'fa fa-dollar-sign',
    subMenu: [
      {
        id: '131',
        title: 'Settings',
      },
      {
        id: '132',
        title: 'Tax Exemptions',
      },
      {
        id: '133',
        title: 'Tax Declarations',
      },
      {
        id: '134',
        title: 'Tax Overrides',
      },
      {
        id: '135',
        title: 'eTDS',
      }
    ]
  },
  {
    id: '14',
    title: 'Reports',
    icon: 'fa fa-chart-line',
  },
  {
    id: '15',
    title: 'Separation',
    icon: 'fas fa-divide',
    subMenu: [
      {
        id: '151',
        title: 'Settings',
      },
      {
        id: '152',
        title: 'All Separations Requests',
      },
      {
        id: '153',
        title: 'Asset Deallocations Request',
      }
    ]
  },
  {
    id: '16',
    title: 'Settings',
    icon: 'fa fa-wrench'
  }
];

export const SideBarUserMenu = [
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
    id: '3',
    title: 'RealTime',
    icon: 'fa fa-clock'
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
    subMenu: [
      {
        id: '51',
        title: 'Company Policies',
      },
      {
        id: '52',
        title: 'Organization Tree',
      },
      {
        id: '53',
        title: 'Employee Tree',
      }
    ]
  },
  {
    id: '6',
    title: 'Calendar',
    icon: 'fa fa-calendar-alt',
  },
  {
    id: '7',
    title: 'Leave',
    icon: 'fas fa-walking',
    subMenu: [

      {
        id: '71',
        title: 'My Application',
      },
      {
        id: '72',
        title: 'My Leave Grant',
      },
      {
        id: '73',
        title: 'General Information',
      }
    ]
  },
  {
    id: '8',
    title: 'Attendance',
    icon: 'fa fa-check-square',
    subMenu: [
      {
        id: '81',
        title: 'My Attendance Records',
      },
      {
        id: '82',
        title: 'My Regularization Requests',
      },
      {
        id: '83',
        title: 'OnDuty Requests',
      },
      {
        id: '84',
        title: 'My Roaster Records',
      }
    ]
  },
  {
    id: '9',
    title: 'Timesheets',
    icon: 'fa fa-clock',
    subMenu: [
      {
        id: '91',
        title: 'Timesheets',
      }
    ]
  },
  {
    id: '10',
    title: 'Taxation',
    icon: 'fa fa-dollar-sign',
    subMenu: [
      {
        id: '101',
        title: 'My Tax Declarations',
      }
    ]
  },
  {
    id: '11',
    title: 'Expenses',
    icon: 'fa fa-money-bill',
    subMenu: [
      {
        id: '111',
        title: 'My Expenses',
      },
      {
        id: '112',
        title: 'My Advances',
      },
      {
        id: '113',
        title: 'General Information',
      }
    ]
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
    subMenu: [
      {
        id: '131',
        title: 'Initiate/Check Status',
      }
    ]
  },
  {
    id: '14',
    title: 'Reports',
    icon: 'fa fa-chart-line',
    subMenu: [
      {
        id: '141',
        title: 'General Reports',
      },
      {
        id: '142',
        title: 'My Reports',
      },
      {
        id: '143',
        title: 'Timesheet',
      },
      {
        id: '144',
        title: 'Timeline',
        url: '/timeline',
      },
      {
        id: '145',
        title: 'Attendance',
        url: '/attendance',
      },
      {
        id: '146',
        title: 'Activity Level',
      },
      {
        id: '147',
        title: 'Statistics',
      },
      {
        id: '148',
        title: 'Activity Description',
      },
      {
        id: '149',
        title: 'Apps and Websites',
      },
      {
        id: '1410',
        title: 'Tasks',
      },
      {
        id: '1411',
        title: 'Productivity',
      },
      {
        id: '1412',
        title: 'Leave',
      }
    ],
  },
  {
    id: '15',
    title: 'Settings',
    icon: 'fa fa-wrench',
  },
  {
    id: '15',
    title: 'Manual Time',
    icon: 'fa fa-wrench',
    url: '/requestManualTime',
  }
];


