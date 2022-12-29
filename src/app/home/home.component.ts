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
  status: boolean = false;
  menuList: any = SideBarUserMenu;
  spinnerStyle = Spinkit;
  constructor(private router: Router, private auth: AuthenticationService) { }

  ngOnInit(): void {
    let roleId = localStorage.getItem('roleId');
    this.auth.getRole(roleId).subscribe((response: any) => {
      let role = response && response.data && response.data[0].Name;
      if (role.toLowerCase() == 'user') {
        this.menuList = SideBarUserMenu
      }
      if (role.toLowerCase() == 'admin') {
        this.menuList = SideBarAdminMenu
      }
    });
  }
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
    this.status = !this.status
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
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '41',
        title: 'Organization Setup',
        icon: 'fa fa-briefcase'

      },
      {
        id: '42',
        title: 'Employee Fields',
        icon: 'fa fa-clock'      
      },
      {
        id: '43',
        title: 'Employee Tree',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '44',
        title: 'Documents',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '45',
        title: 'Assets Management',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '46',
        title: 'Access Management',
        icon: 'fa fa-pencil-square',
      }
    ],
  },
  {
    id: '5',
    title: 'Manage',
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '51',
        title: 'Employees',
        icon: 'fa fa-users',
        url: 'people'
      },
      {
        id: '53',
        title: 'Projects',
        icon: 'fa fa-pencil-square',
        url: 'project',
      },
      {
        id: '54',
        title: 'Tasks',
        icon: 'fa fa-tasks',
      },
      {
        id: '55',
        title: 'Manual Time',
        icon: 'fa fa-envelope',
      },

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
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '81',
        title: 'Settings',
        icon: 'fa fa-clock'
      },
      {
        id: '82',
        title: 'Attendance Records',
        icon: 'fa fa-clock'
      },
      {
        id: '83',
        title: 'Roaster Records',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'Regularization Requests',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'OnDuty Requests',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'Attendance Audit',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'Attendance Process',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'Attendance Reconciliation',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'Biometric Logs',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'Biometric Reconciliation',
        icon: 'fa fa-pencil-square',
      }
    ]
  },
  {
    id: '8',
    title: 'Timesheets',
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '91',
        title: 'Settings',
        icon: 'fa fa-clock'
      },
      {
        id: '91',
        title: 'Projects',
        icon: 'fa fa-clock'
      },
      {
        id: '91',
        title: 'Timesheets',
        icon: 'fa fa-clock'

      },
      {
        id: '91',
        title: 'Time Approvals',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '9',
    title: 'Leave',
    icon: 'fa fa-get-pocket',
    subMenu: [

      {
        id: '71',
        title: 'Settings',
        icon: 'fa fa-clock',
      },
      {
        id: '72',
        title: 'Leave Grant',
        icon: 'fa fa-clock',
      },
      {
        id: '73',
        title: 'Leave Balance',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '72',
        title: 'Leave Application',
        icon: 'fa fa-clock',
      },
      {
        id: '73',
        title: 'Short Leave',
        icon: 'fa fa-pencil-square',
      }
    ]
  },
  {
    id: '10',
    title: 'Expenses',
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '111',
        title: 'Settings',
        icon: 'fa fa-clock'

      },
      {
        id: '112',
        title: 'Expense Reports',
        icon: 'fa fa-clock'

      },
      {
        id: '113',
        title: 'Advanced Reports',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '11',
    title: 'Alerts',
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '111',
        title: 'Setup Issues',
        icon: 'fa fa-clock'

      },
      {
        id: '112',
        title: 'Pending Reports',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '12',
    title: 'Payroll',
    icon: 'fa fa-get-pocket',
    subMenu: [

      {
        id: '121',
        title: 'Settings',
        icon: 'fa fa-clock'

      },
      {
        id: '122',
        title: 'CTC Template',
        icon: 'fa fa-clock'

      },
      {
        id: '123',
        title: 'LOP Reversal',
        icon: 'fa fa-clock'

      },
      {
        id: '124',
        title: 'Run Pyroll',
        icon: 'fa fa-clock'

      },
      {
        id: '125',
        title: 'Full and Final',
        icon: 'fa fa-clock'

      },
      {
        id: '126',
        title: 'Payslips',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '13',
    title: 'Taxation',
    icon: 'fa fa-get-pocket',

    subMenu: [

      {
        id: '131',
        title: 'Settings',
        icon: 'fa fa-clock'

      },
      {
        id: '132',
        title: 'Tax Exemptions',
        icon: 'fa fa-clock'

      },
      {
        id: '133',
        title: 'Tax Declarations',
        icon: 'fa fa-clock'

      },
      {
        id: '134',
        title: 'Tax Overrides',
        icon: 'fa fa-clock'

      },
      {
        id: '135',
        title: 'eTDS',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '14',
    title: 'Reports',
    icon: 'fa fa-file',

  },
  {
    id: '15',
    title: 'Separation',
    icon: 'fa fa-get-pocket',

    subMenu: [

      {
        id: '151',
        title: 'Settings',
        icon: 'fa fa-wrench',


      },
      {
        id: '152',
        title: 'All Separations Requests',
        icon: 'fa fa-clock',

      },
      {
        id: '153',
        title: 'Asset Deallocations Request',
        icon: 'fa fa-pencil-square',

      }
    ]
  },
  {
    id: '16',
    title: 'Settings',
    icon: 'fa fa-wrench',

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
    icon: 'fa fa-clock',


  },
  {
    id: '4',
    title: 'Alerts',
    icon: 'fa fa-bell'
  },
  {
    id: '5',
    title: 'Organization',
    icon: 'fa fa-get-pocket',

    subMenu: [

      {
        id: '51',
        title: 'Company Policies',
        icon: 'fa fa-refresh',


      },
      {
        id: '52',
        title: 'Organization Tree',
        icon: 'fa fa-building',

      },
      {
        id: '53',
        title: 'Employee Tree',
        icon: 'fa fa-pencil-square',

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
    icon: 'fa fa-get-pocket',
    subMenu: [

      {
        id: '71',
        title: 'My Application',
        icon: 'fa fa-clock',


      },
      {
        id: '72',
        title: 'My Leave Grant',
        icon: 'fa fa-clock',

      },
      {
        id: '73',
        title: 'General Information',
        icon: 'fa fa-pencil-square',
      }
    ]
  },
  {
    id: '8',
    title: 'Attendance',
    icon: 'fa fa-get-pocket',
    subMenu: [

      {
        id: '81',
        title: 'My Attendance Records',
        icon: 'fa fa-clock'

      },
      {
        id: '82',
        title: 'My Regularization Requests',
        icon: 'fa fa-clock'
      },
      {
        id: '83',
        title: 'OnDuty Requests',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '84',
        title: 'My Roaster Records',
        icon: 'fa fa-pencil-square',
      }
    ]
  },
  {
    id: '9',
    title: 'Timesheets',
    icon: 'fa fa-get-pocket',
    subMenu: [
      {
        id: '91',
        title: 'Timesheets',
        icon: 'fa fa-clock'
      }
    ]
  },
  {
    id: '10',
    title: 'Taxation',
    icon: 'fa fa-get-pocket',

    subMenu: [

      {
        id: '101',
        title: 'My Tax Declarations',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '11',
    title: 'Expenses',
    icon: 'fa fa-get-pocket',

    subMenu: [

      {
        id: '111',
        title: 'My Expenses',
        icon: 'fa fa-clock'

      },
      {
        id: '112',
        title: 'My Advances',
        icon: 'fa fa-clock'

      },
      {
        id: '113',
        title: 'General Information',
        icon: 'fa fa-clock'

      }
    ]
  },
  {
    id: '12',
    title: 'PaySlips',
    icon: 'fa fa-envelope-open',

  },
  {
    id: '13',
    title: 'Separation',
    icon: 'fa fa-get-pocket',
    subMenu: [

      {
        id: '121',
        title: 'Initiate/Check Status',
        icon: 'fa fa-check-circle'

      }
    ]
  },
  {
    id: '13',
    title: 'Reports',
    icon: 'fa fa-get-pocket',
   subMenu: [
      {
        id: '1311',
        title: 'General Reports',
        icon: 'fa fa-file'

      },
      {
        id: '1312',
        title: 'My Reports',
        icon: 'fa fa-file'
    },
      {
        id: '131',
        title: 'Timesheet',
        icon: 'fa fa-newspaper'

      },
      {
        id: '132',
        title: 'Timeline',
        icon: 'fa fa-sitemap',
        url: '/timeline',
      },
      {
        id: '133',
        title: 'Attendance',
        icon: 'fa fa-pencil-square',
        url: '/attendance',
      },
      {
        id: '134',
        title: 'Activity Level',
        icon: 'fa fa-database',
      },
      {
        id: '135',
        title: 'Statistics',
        icon: 'fa fa-chart-line',
      },
      {
        id: '136',
        title: 'Activity Description',
        icon: 'fa fa-pencil-square',
      },
      {
        id: '137',
        title: 'Apps and Websites',
        icon: 'fa fa-address-book',
      },
      {
        id: '138',
        title: 'Tasks',
        icon: 'fa fa-tasks',
      },
      {
        id: '139',
        title: 'Productivity',
        icon: 'fa fa-cube',
      },
      {
        id: '1310',
        title: 'Leave',
        icon: 'fa fa-pencil-square-o',
      }
    ],
  },
  {
    id: '14',
    title: 'Settings',
    icon: 'fa fa-wrench',
  }];


