import { company } from "./company";
import { Role, userRole } from "./role.model";

export class User {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    token: string;
    role: Role;
    name:string;
    email: string;
    freeCompany: boolean;
    empCode?: number;
}
export class updateUser{
  firstName: string;
  lastName: string;
  jobTitle: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  extraDetails: string;
}

export class newUser{
  [x: string]: any;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: string;
  phone: Number;
 }

export class signup{
  id: string;
  firstName: string;
  lastName:string;
  email: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  companyId:string;
  freeCompany: boolean;
  role:string;
  jobTitle: String;
  address: String;
  city: String;
  state: String;
  country:string;
  pincode: String;
  phone: Number;
  extraDetails: String;
  isSuperAdmin: Boolean;
  status: String;
  photo: String;
  active: Boolean;
  createdBy: String;
  updatedBy: String;
  createdOn: Date;
  updatedOn: Date;
  empCode?: number;
}
export class changeUserPassword{
  passwordCurrent:string;
  password: string;
  passwordConfirm: string;
  id:string;
}

export class webSignup{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  companyName: string
}