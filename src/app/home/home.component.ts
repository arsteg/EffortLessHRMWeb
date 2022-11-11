import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit} from 'ng-http-loader';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  title = 'sideBarNav';
  status: boolean = false;
  menuList = SideBarMenu ;
  spinnerStyle = Spinkit;
  constructor(private router:Router) { }

  ngOnInit(): void {
  }
  onLogout(){
    localStorage.removeItem('user.email')
   this.router.navigateByUrl('/login')
   }
   
    clickMenu(id:string){
      this.menuList.forEach(element => {
        if(element.id == id){
        element.show = !element.show;
      }
      });
  
    }
    
  clickEvent(){
      this.status = !this.status;
    }
  }
  
  
  export const SideBarMenu = [
  {
   id: '1',
   title: 'Dashboard',
   icon: 'fa fa-dashboard',
   url: '/dashboard',
   show:true,
  },
  {
    id: '2',
    title: 'RealTime',
    icon: 'fa fa-clock',
    url: '',
    show:true,
   },
   {
    id: '3',
    title: 'Screenshots',
    icon: 'fa fa-camera',
    url: '/screenshots',
    show:true,
   },
    {
   id: '4',
   title: 'Reports',
   icon: 'icon-layout menu-icon',
   url: '',
   show:true,
   subMenu: [
     {
       id: '41',
       title: 'Timesheet',
       icon: 'fa fa-clock',
       url: '',
      },
     {
       id: '42',
       title: 'Timeline',
       icon: 'fa fa-clock',
       url: '',
     },
     {
      id: '43',
      title: 'Attendance',
      icon: 'fa fa-pencil-square',
      url: '',
    },
    {
      id: '44',
      title: 'Activity Level',
      icon: 'fa fa-pencil-square',
      url: '',
    },
    {
      id: '45',
      title: 'Activity Level',
      icon: 'fa fa-pencil-square',
      url: '',
    },
    {
      id: '46',
      title: 'Activity Description',
      icon: 'fa fa-pencil-square',
      url: '',
    },
    {
      id: '47',
      title: 'Apps and Websites',
      icon: 'fa fa-credit-card',
      url: '',
    },
    {
      id: '48',
      title: 'Tasks',
      icon: 'fa fa-tasks',
      url: '',
    },
    {
      id: '49',
      title: 'Productivity',
      icon: 'fa fa-cube',
      url: '',
    },
    {
      id: '410',
      title: 'Leave',
      icon: 'fa fa-remove',
      url: '',
    },
    {
      id: '411',
      title: 'Invoice',
      icon: 'fa fa-pencil-square',
      url: '',
    }
   ],
  },
  {
   id: '5',
   title: 'Manage',
   icon: 'icon-layout menu-icon',
   url: '',
   show:true,
   subMenu: [
     {
       id: '51',
       title: 'People',
       icon: 'fa fa-users',
       url: '',
      },
      {
       id: '52',
       title: 'Team Members',
       icon: 'fa fa-users',
       url: 'teamMembers',
     },
     {
       id: '53',
       title: 'Projects',
       icon: 'fa fa-pencil-square',
       url: '',
      },
      {
        id: '54',
        title: 'Tasks',
        icon: 'fa fa-tasks',
        url: '',
       },
       {
        id: '55',
        title: 'Messages',
        icon: 'fa fa-envelope',
        url: '',
       },
       {
        id: '56',
        title: 'Manual Time',
        icon: 'fa fa-clock',
        url: '',
       },
       {
        id: '57',
        title: 'Time Off Time',
        icon: 'fa fa-clock',
        url: '',
       },
       {
        id: '58',
        title: 'Settings',
        icon: 'fa fa-gear',
        url: '',
       },
    ],
  }
  ];
  

