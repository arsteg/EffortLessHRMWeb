import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ChangePasswordComponent } from '../login/change-password/change-password.component';
import { User } from '../models/user';
import { ProjectListComponent } from '../Project/project-list/project-list.component';
import { UserListComponent } from '../users/user-list/user-list.component';
import { UserProfileComponent } from '../users/user-profile/user-profile.component';
import { ScreenshotsComponent } from '../screenshots/screenshots/screenshots.component';
import { Role } from '../models/role.model';
import { AuthGuard } from '../_helpers/auth.guard';
import { TeammembersComponent } from '../manage/teammembers/teammembers.component';

export const LayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'project',      component: ProjectListComponent },
    { path: 'changePassword',      component: ChangePasswordComponent },
    { path: 'users',      component: UserListComponent },
    { path: 'teamMembers',      component: TeammembersComponent },
    {path:'user-profile',component: UserProfileComponent},
    {
      path:'screenshots',
      component: ScreenshotsComponent,
      canActivate: [AuthGuard],
      data: { roles: [Role.Admin] }
    }
];
