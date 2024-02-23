import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-Assignment',
  templateUrl: './leave-assignment.component.html',
  styleUrls: ['./leave-assignment.component.css']
})
export class LeaveAssignmentComponent implements OnInit {
  searchText: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
