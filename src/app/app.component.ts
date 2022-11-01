import { Component,OnInit } from '@angular/core';
import { Spinkit} from 'ng-http-loader';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'sideBarNav';
  status: boolean = false;
  menuList = SideBarMenu ;
  spinnerStyle = Spinkit;

  ngOnInit() {

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
 icon: '',
 url: 'dashboard',
 show:true,
},
{
  id: '2',
  title: 'RealTime',
  icon: '',
  url: '',
  show:true,
 },
 {
  id: '3',
  title: 'Screenshots',
  icon: '',
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
     icon: '',
     url: '',
    },
   {
     id: '42',
     title: 'Timeline',
     icon: '',
     url: '',
   },
   {
    id: '43',
    title: 'Attendance',
    icon: '',
    url: '',
  },
  {
    id: '44',
    title: 'Activity Level',
    icon: '',
    url: '',
  },
  {
    id: '45',
    title: 'Activity Level',
    icon: '',
    url: '',
  },
  {
    id: '46',
    title: 'Activity Description',
    icon: '',
    url: '',
  },
  {
    id: '47',
    title: 'Apps and Websites',
    icon: '',
    url: '',
  },
  {
    id: '48',
    title: 'Tasks',
    icon: '',
    url: '',
  },
  {
    id: '49',
    title: 'Productivity',
    icon: '',
    url: '',
  },
  {
    id: '410',
    title: 'Leave',
    icon: '',
    url: '',
  },
  {
    id: '411',
    title: 'Invoice',
    icon: '',
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
     icon: '',
     url: '',
    },
    {
     id: '52',
     title: 'Team Members',
     icon: '',
     url: 'teamMembers',
   },
   {
     id: '53',
     title: 'Projects',
     icon: '',
     url: '',
    },
    {
      id: '54',
      title: 'Tasks',
      icon: '',
      url: '',
     },
     {
      id: '55',
      title: 'Messages',
      icon: '',
      url: '',
     },
     {
      id: '56',
      title: 'Manual Time',
      icon: '',
      url: '',
     },
     {
      id: '57',
      title: 'Time Off Time',
      icon: '',
      url: '',
     },
     {
      id: '58',
      title: 'Settings',
      icon: '',
      url: '',
     },
  ],
}
];
