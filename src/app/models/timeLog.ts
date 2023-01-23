export class timeLog{
  user:string;
  task: String;
  startTime: Date;
  date: Date;
  endTime: Date;
  filePath:string;
  fileString: string;
  keysPressed:number;
  scrolls: number;
  clicks: number;
  url: string;
  _id: string;
}

export class screenshotRow {
  col1: screenShotCell;
  col2: screenShotCell;
  col3: screenShotCell;
  col4: screenShotCell;
  col5: screenShotCell;
  col6: screenShotCell;
  hasData(){
    return this.col1 || this.col2 || this.col3|| this.col4|| this.col5|| this.col6;
  }
}

export class screenShotCell{
  constructor(
    public timeLabel:string,
    public fileString:string,
    public clicks:number,
    public keysPressed:number,
    public scrolls: number,
    public url:string,
    public _id:string,
    public isSelected: boolean,
    public hasValue:boolean){}
    public get GetActivityLevel() {
      let count =  this.clicks + this.keysPressed;
      return count<=0? ActivityLevel.none:count<=30? ActivityLevel.low: count<100?  ActivityLevel.medium: ActivityLevel.high;
  }
  
}

export enum ActivityLevel{
none,
low,
medium,
high
}
