export enum Permission {
    User = 'User',
    Admin = 'Admin'
  }
  export class rolePermission{
    permissionName : string;
    permissionDetails : string; 
    parentPermission : number;
  }
  export class createRolePermissions{
    roleId: string;
    permissionId: string;
  }