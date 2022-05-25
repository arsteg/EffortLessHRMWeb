
export class User {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    token: string;
}

export class signup{
  id: string;
  firstName: string;
  lastName:string;
  email: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
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
  status: String;zation
  photo: String;
  active: Boolean;
  createdBy: String;
  updatedBy: String;
  createdOn: Date;   
  updatedOn: Date;
}
export class changeUserPassword{
  passwordCurrent:string;
  password: string;
  passwordConfirm: string;  
  id:string;
}
