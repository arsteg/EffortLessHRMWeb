import { User } from "src/app/models/user"

export class project{
      projectName: String;      
      startDate: Date;      
      endDate:  Date;
      estimatedTime:Number;     
      notes:String;      
      createdOn: Date;
      updatedOn: Date;
      createdBy: User;
      updatedBy: User;
      status: string;
      id: string;
      company: {
        _id: string,
        companyName: string,
        id: string
      };
      
  }

  export class addUser{
    projectId: project[];
    projectUsers: [
        {
            users: string
        }
    ]
  }