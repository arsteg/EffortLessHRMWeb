export interface HoursWorked {
  today: number;
  previousDay: number;
  change: number;
  changeDisplay: string;
  increased: boolean;
  changeColor: string;
  chartData: any[];
  chartColors: any[];
}
export interface WeeklySummary {
  currentWeek: number;
  previousWeek: number;
  change: number;
  increased: boolean;
  changeDisplay: string;
  changeColor: string;
  chartData: any[];
  chartColors: any[];
}
export interface MonthlySummary {
  currentMonth: number;
  previousMonth: number;
  change: number;
  changeDisplay: string;
  increased: boolean;
  changeColor: string;
  chartData: any[];
  chartColors: any[];
}
export interface ProjectTask {
  projectName: string;
  tasks: Task[];
}
export interface Task {
  taskName: string;
  totalTime: number;
}

