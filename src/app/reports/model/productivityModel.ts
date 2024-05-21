
export class productivityModel {
  user: String;
  doj: Date;
  totalTimeTracked:Number;     
  totalIdleTime:Number;      
  totalMouse: Number;
  totalKeyboardClicks: Number;
  totalScroll: Number;
  applicationUsages: applicationUsages[];
}

export class applicationUsages{
  applicationName: string;
  totalTimeSpand: string;
  applicationCategory: string;
}

export class SearchTaskRequest {
  users: string;
  projects: string;
  // tasks: [];     
  fromdate:Date = new Date();      
  todate: Date= new Date();
}
export class Timesheet{
  users: [];
  projects: [];
  fromdate:Date = new Date();      
  todate: Date= new Date();
}
export class Leave{
    users: [];
    fromdate:Date = new Date();      
    todate: Date= new Date();
}

export class Activity{
  users: [];
  projects: [];
  tasks: [];
  fromdate:Date = new Date();      
  todate: Date= new Date();
}

export class Productivity{
  users: [];
  fromdate:string = "";      
  todate: string= "";
}
export class Attendance{
  users: [];
  fromdate:Date = new Date();      
  todate: Date= new Date();
}

export class SearchAppUsagesRequest {
  users: [];
  projects: []; 
  fromdate:string = "";      
  todate: string= "";
}
export class TimeLine{
  users: [];
  projects: [];
  fromdate:Date = new Date();      
  todate: Date= new Date();
}