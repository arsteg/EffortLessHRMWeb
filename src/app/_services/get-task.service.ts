import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetTaskService {
  private taskId: string;
  constructor() { }

  setTaskId(taskId: string): void {
    this.taskId = taskId;
    // localStorage.setItem('taskId', this.taskId)
  }

  getTaskId(): string {
    // if (!this.taskId) {
    //   this.taskId = localStorage.getItem('taskId')
    // }
    return this.taskId;
  }
}
