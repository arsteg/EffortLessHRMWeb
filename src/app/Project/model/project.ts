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
      status: String;
  }