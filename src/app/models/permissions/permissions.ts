// src/app/rbac/types.ts
export interface Permission {
    _id: string;
    permissionName: string;
    permissionDetails?: string;
    resource: string; // e.g., employees, time-tracker
    action: string; // e.g., read, write, delete
    uiElement?: string; // e.g., button:edit-employee
    parentPermission?: string; // ObjectId
  }
  
  export interface Role {
    _id: string;
    name: string;
    description?: string;
    company: { _id: string; companyName: string };
    active: boolean;
    createdBy?: string; // ObjectId
    updatedBy?: string; // ObjectId
    createdOn: string; // ISO date
    updatedOn: string; // ISO date
    rolePermission?: RolePermission[];
  }
  
  export interface RolePermission {
    _id: string;
    roleId: { _id: string; name: string; description?: string };
    permissionId: Permission;
    company: { _id: string; companyName: string };
    createdBy?: string; // ObjectId
    updatedBy?: string; // ObjectId
    createdOn: string; // ISO date
    updatedOn: string; // ISO date
  }
  
  export interface User {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    company: { _id: string; companyName: string };
    role?: { _id: string; name: string };
  }
  
  export interface UserRole {
    _id: string;
    userId: { _id: string; firstName: string; lastName?: string; email: string };
    roleId: { _id: string; name: string; description?: string };
    company: { _id: string; companyName: string };
    createdBy?: string; // ObjectId
    updatedBy?: string; // ObjectId
    createdOn: string; // ISO date
    updatedOn: string; // ISO date
  }