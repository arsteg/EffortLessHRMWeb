import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-Template',
  templateUrl: './leave-template.component.html',
  styleUrls: ['./leave-template.component.css']
})
export class LeaveTemplateComponent implements OnInit {
  searchText: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
