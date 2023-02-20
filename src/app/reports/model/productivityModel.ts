
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
  users: [];
  projects: [];
  tasks: [];     
  fromdate:Date = new Date();      
  todate: Date= new Date();
}