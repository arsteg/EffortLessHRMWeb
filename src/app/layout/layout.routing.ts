import { Routes } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard.component';
import { ChangePasswordComponent } from '../login/change-password/change-password.component';
import { User } from '../models/user';

import { ProjectListComponent } from '../Project/project-list/project-list.component';
import { UserListComponent } from '../users/user-list/user-list.component';
import { UserProfileComponent } from '../users/user-profile/user-profile.component';


export const LayoutRoutes: Routes = [
    // {
    //   path: '',
    //   children: [ {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // }]}, {
    // path: '',
    // children: [ {
    //   path: 'userprofile',
    //   component: UserProfileComponent
    // }]
    // }, {
    //   path: '',
    //   children: [ {
    //     path: 'icons',
    //     component: IconsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'notifications',
    //         component: NotificationsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'maps',
    //         component: MapsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'typography',
    //         component: TypographyComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'upgrade',
    //         component: UpgradeComponent
    //     }]
    // }
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'project',      component: ProjectListComponent },
    { path: 'changePassword',      component: ChangePasswordComponent },
    { path: 'users',      component: UserListComponent },
    {path:'user-profile',component: UserProfileComponent}
   
];
