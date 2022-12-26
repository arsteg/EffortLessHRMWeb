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
   this.router.navigateByUrl('/main')
   }
   
    clickMenu(id:string){
      this.menuList.forEach(element => {
        if(element.id == id){
        element.show = !element.show;
      }
      });
  
    }
    
  clickEvent(){
      this.status = !this.status
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
     url:'/realtime',
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
   icon: 'fa fa-get-pocket',
  
   show:true,
   subMenu: [
     {
       id: '41',
       title: 'Timesheet',
       icon: 'fa fa-clock'
     
      },
     {
       id: '42',
       title: 'Timeline',
       icon: 'fa fa-clock',
       url: '/timeline',
       show:true,
      
     },
     {
      id: '43',
      title: 'Attendance',
      icon: 'fa fa-pencil-square',
      url: '/attendance',
    },
    {
      id: '44',
      title: 'Activity Level',
      icon: 'fa fa-pencil-square',
     
    },
    {
      id: '45',
      title: 'Activity Level',
      icon: 'fa fa-pencil-square',
     
    },
    {
      id: '46',
      title: 'Activity Description',
      icon: 'fa fa-pencil-square',
     
    },
    {
      id: '47',
      title: 'Apps and Websites',
      icon: 'fa fa-credit-card',
      
    },
    {
      id: '48',
      title: 'Tasks',
      icon: 'fa fa-tasks',
       
    },
    {
      id: '49',
      title: 'Productivity',
      icon: 'fa fa-cube',
       
    },
    {
      id: '410',
      title: 'Leave',
      icon: 'fa fa-remove',
       
    },
    {
      id: '411',
      title: 'Invoice',
      icon: 'fa fa-pencil-square',
       
    }
   ],
  },
  {
   id: '5',
   title: 'Manage',
   icon: 'fa fa-get-pocket',
  //   
   show:true,
   subMenu: [
   
     {
       id: '51',
       title: 'People',
       icon: 'fa fa-users',
       url: 'people'
        
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
       url: 'project',
      },
      {
        id: '54',
        title: 'Tasks',
        icon: 'fa fa-tasks',
         
       },
       {
        id: '55',
        title: 'Messages',
        icon: 'fa fa-envelope',
         
       },
       {
        id: '56',
        title: 'Manual Time',
        icon: 'fa fa-clock',
         
       },
       {
        id: '57',
        title: 'Time Off Time',
        icon: 'fa fa-clock',
         
       },
       {
        id: '58',
        title: 'Settings',
        icon: 'fa fa-gear',
         
       },
       {
        id: '59',
        title: 'Roles',
        icon: 'fa fa-users',
        url: '/roles',
       },
       {
        id: '50',
        title: 'Permission',
        icon: 'fa fa-users',
        url: '/permissionModel',
       },
    ],
  }
  ];
  

