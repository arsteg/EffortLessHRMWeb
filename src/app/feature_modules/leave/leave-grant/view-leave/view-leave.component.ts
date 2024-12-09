import { Component, Output, EventEmitter } from '@angular/core';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-view-leave',
  templateUrl: './view-leave.component.html',
  styleUrl: './view-leave.component.css'
})
export class ViewLeaveComponent {
  @Output() close: any = new EventEmitter();

  constructor(public leaveService: LeaveService) {

  }

  ngOnInit() {
    this.leaveService.leave.getValue();
  }

  closeModal() {
    this.close.emit(true);
  }
}

