export interface HoursWorked {
  today: number;
  previousDay: number;
  change:number
  increased:boolean
}
export interface WeeklySummary {
  currentWeek: number;
  previousWeek: number;
  change:number
  increased:boolean
}
export interface MonthlySummary {
  currentMonth: number;
  previousMonth: number;
  change:number
  increased:boolean
}
export interface ProjectTask {
  projectName: string;
  tasks: Task[];
}
export interface Task {
  taskName: string;
  totalTime: number;
}

