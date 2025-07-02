import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { Role, Permission, UserRole, RolePermission } from 'src/app/models/permissions/permissions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleDialogComponent } from '../role-dialog/role-dialog.component';
import { PermissionDialogComponent } from '../permission-dialog/permission-dialog.component';
import { UserRoleDialogComponent } from '../user-role-dialog/user-role-dialog.component';
import { RolePermissionDialogComponent } from '../role-permission-dialog/role-permission-dialog.component';
import { ExportService } from 'src/app/_services/export.service';
import { UserService } from 'src/app/_services/users.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  currentTab: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  totalRoles: number = 0;
  totalPermissions: number = 0;
  totalUserRoles: number = 0;
  totalRolePermissions: number = 0;
  allData = [];
  filteredGroupedRolePermissions: { role: string, roleId: string, permissions: any[] }[] = [];

  // Data sources for each tab
  rolesDataSource = new MatTableDataSource<Role>([]);
  permissionsDataSource = new MatTableDataSource<Permission>([]);
  userRolesDataSource = new MatTableDataSource<UserRole>([]);
  rolePermissionsDataSource = new MatTableDataSource<RolePermission>([]);
  //groupedRolePermissions: { role: string, permissions: RolePermission[] }[] = [];
  groupedRolePermissions: { role: string, roleId: string, permissions: any[] }[] = [];

  // Displayed columns for each tab
  rolesColumns: TableColumn[] = [
      {
        key: 'name',
        name: 'Name',
      },
      {
        key: 'description',
        name: 'Description'
      }
    ]
  permissionsColumns: TableColumn[] = [
      {
        key: 'permissionName',
        name: 'Permission Name',
      },
      {
        key: 'resource',
        name: 'Resource'
      },
      {
        key: 'action',
        name: 'Action'
      },
      {
        key: 'uiElement',
        name: 'UI Element'
      },
    ]
  userRolesColumns: TableColumn[] = [
      {
        key: 'user',
        name: 'User',
      },
      {
        key: 'role',
        name: 'Role'
      },
      {
        key: 'action',
        name: 'Action',
        isAction: true,
        options: [
          { label: 'Edit', visibility: ActionVisibility.LABEL, icon: 'edit' },
          { label: 'Delete', visibility: ActionVisibility.LABEL, icon: 'delete' }
        ]
      }
    ]
  rolePermissionsColumns: string[] = ['role', 'permission', 'actions'];

  users: any[] = [];
  roles: Role[] = [];
  permissions: Permission[] = [];

  constructor(
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private exportService: ExportService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
    this.loadUserRoles();
    this.loadRolePermissions();
  }

  switchTab(tabIndex: number) {
    this.currentTab = tabIndex;
    this.currentPage = 1;
    this.loadUsers();
    this.loadData();
  }

  loadData() {
    switch (this.currentTab) {
      case 0:
        this.loadRoles();
        break;
      case 1:
        this.loadPermissions();
        break;
      case 2:
        this.loadUserRoles();
        break;
      case 3:
        this.loadRolePermissions();
        break;
    }
  }

  loadRoles() {
    this.authService.getRoles().subscribe((res: any) => {
      this.rolesDataSource.data = res.data;
      this.roles = res.data;
      this.allData = structuredClone(this.roles);
      this.totalRoles = res.total || res.data.length;
    });
  }

  loadPermissions() {
    this.authService.getPermissions().subscribe((res: any) => {
      this.permissionsDataSource.data = res.data.permissionList;
      this.permissions = res.data.permissionList;
      this.allData = structuredClone(this.permissions);
      this.totalPermissions = res.total || res.data.length || res.data.permissionList.length;
    });
  }

  loadUserRoles() {
    this.authService.getUserRoles().subscribe((res: any) => {
      this.userRolesDataSource.data = res.data.map((ur: any) => ({
        ...ur,
        user: this.getUserName(ur.userId._id),
        role: this.getRoleName(ur.roleId._id),
      }));
      this.totalUserRoles = res.total || res.data.length;
    });
  }

  // loadRolePermissions() {
  //   this.authService.getRolePermissions().subscribe((res: any) => {
  //     const data = res.data.map((rp: any) => ({
  //       ...rp,
  //       role: this.getRoleName(rp.roleId._id),
  //       permission: this.getPermissionName(rp.permissionId._id),
  //     }));
  //     const groupedMap = new Map<string, RolePermission[]>();
  //     data.forEach((item) => {
  //       const roleName = item.role;
  //       if (!groupedMap.has(roleName)) {
  //         groupedMap.set(roleName, []);
  //       }
  //       groupedMap.get(roleName)?.push(item);
  //     });
  //     this.groupedRolePermissions = Array.from(groupedMap.entries()).map(([role, permissions]) => ({
  //       role,
  //       permissions
  //     }));
  //     this.totalRolePermissions = res.total || res.data.length;
  //   });
  // }
  loadRolePermissions() {
    this.authService.getRolePermissions().subscribe((res: any) => {
      const data = res.data;
      this.rolePermissionsDataSource.data = data;
      const groupedMap = new Map<string, { roleId: string, permissions: Permission[] }>();
      this.roles.forEach(role => {
        groupedMap.set(role.name, { roleId: role._id, permissions: [...this.permissions] });
      });
      this.groupedRolePermissions = Array.from(groupedMap.entries()).map(([role, { roleId, permissions }]) => ({
        role,
        roleId,
        permissions
      }));
      this.filteredGroupedRolePermissions = structuredClone(this.groupedRolePermissions);
      this.totalRolePermissions = res.total || res.data.length;
    });
  }

  // applyAccordionFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

  //   this.groupedRolePermissions = this.groupedRolePermissions.map(group => ({
  //     ...group,
  //     permissions: group.permissions.filter(p => 
  //       p.permissionId.permissionName.toLowerCase().includes(filterValue)
  //     )
  //   })).filter(group => group.permissions.length > 0);
  // }

  loadUsers() {
    // Assuming a method to get users exists or needs to be added
    this.userService.getUserList().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPageChange(event: any, dataSource: MatTableDataSource<any>) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.loadData();
  }

  openAddEditDialog(type: 'role' | 'permission' | 'userRole' | 'rolePermission', item?: any) {
    let dialogRef;
    switch (type) {
      case 'role':
        dialogRef = this.dialog.open(RoleDialogComponent, {
          width: '500px',
          data: { role: item, roles: this.roles },
        });
        break;
      case 'permission':
        dialogRef = this.dialog.open(PermissionDialogComponent, {
          width: '500px',
          data: { permission: item, permissions: this.permissions },
        });
        break;
      case 'userRole':
        dialogRef = this.dialog.open(UserRoleDialogComponent, {
          width: '500px',
          data: { userRole: item, users: this.users, roles: this.roles, existingUserRoles: this.userRolesDataSource.data },
        });
        break;
      case 'rolePermission':
        dialogRef = this.dialog.open(RolePermissionDialogComponent, {
          width: '500px',
          data: { rolePermission: item, roles: this.roles, permissions: this.permissions, existingRolePermissions: this.rolePermissionsDataSource.data },
        });
        break;
    }

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteItem(type: 'role' | 'permission' | 'userRole' | 'rolePermission', id: string) {
    if (confirm(this.translate.instant('permissions.confirm_delete'))) {
      switch (type) {
        case 'role':
          this.authService.deleteRole(id).subscribe(() => this.loadRoles());
          break;
        case 'permission':
          this.authService.deletePermission(id).subscribe(() => this.loadPermissions());
          break;
        case 'userRole':
          this.authService.deleteUserRole(id).subscribe(() => this.loadUserRoles());
          break;
        case 'rolePermission':
          this.authService.deleteRolePermission(id).subscribe(() => this.loadRolePermissions());
          break;
      }
    }
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r._id === roleId);
    return role ? role.name : 'Unknown';
  }

  getPermissionName(permissionId: string): string {
    const permission = this.permissions.find(p => p._id === permissionId);
    return permission ? permission.permissionName : 'Unknown';
  }

  exportToCsv() {
    const dataToExport = this.permissionsDataSource.data;
    this.exportService.exportToCSV('Permissions', '', dataToExport);
  }

  onPageChangeV1(page: any) {
    this.currentPage = page.pageIndex + 1;
    this.recordsPerPage = page.pageSize;
    //this.userId === '' ? this.getProjectList() : this.getProjectsByUser();
  }

  onRoleSearchChange(event) {
    this.roles = this.allData?.filter(row => {
      const found = this.rolesColumns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    }
    );
  }

  onPermissionSearchChange(event) {
    this.permissions = this.permissions?.filter(row => {
      const found = this.permissionsColumns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    }
    );
  }

  onUserRoleSearchChange(event) {
    this.userRolesDataSource.filter = event.trim().toLowerCase();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.openAddEditDialog('userRole', event.row);
        break;
      case 'Delete':
        this.deleteItem('userRole', event.row._id);
        break;
    }
  }

  applyCheckboxFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredGroupedRolePermissions = this.groupedRolePermissions.map(group => ({
      ...group,
      permissions: this.permissions.filter(p =>
        p.permissionName.toLowerCase().includes(filterValue) &&
        group.permissions.some(gp => gp._id === p._id)
      )
    })).filter(group => group.permissions.length > 0);
  }

  isPermissionAssigned(roleId: string, permissionId: string): boolean {
    return this.rolePermissionsDataSource.data.some(rp => rp.roleId?._id === roleId && rp.permissionId?._id === permissionId);
  }

  onPermissionToggle(event: any, roleId: string, permissionId: string) {
    const checked = event.checked;
    const rolePermissionData = { roleId, permissionId };
    if (checked) {
      this.authService.createRolePermission(rolePermissionData).subscribe({
        next: () => {
          this.loadRolePermissions();
          this.toastr.success(this.translate.instant('permissions.role_permissions_added'));
        },
        error: (error) => {
          this.toastr.error(error || this.translate.instant('error'));
          event.source.checked = false; // Revert checkbox on error
        }
      });
    } else {
      const rolePermission = this.rolePermissionsDataSource?.data.find(rp => rp.roleId?._id === roleId && rp?.permissionId?._id === permissionId);
      if (rolePermission) {
        if (confirm(this.translate.instant('permissions.role_permissions_deleted'))) {
          this.authService.deleteRolePermission(rolePermission._id).subscribe(result => {
            this.loadRolePermissions();
            this.toastr.success(this.translate.instant('permissions.remove_role_permission_alert'));
          },
          err => {
            this.toastr.error(this.translate.instant('permissions.role_permission_remove_error'));
          })
        } else {
          event.source.checked = true;
        }
      }
    }
  }
}