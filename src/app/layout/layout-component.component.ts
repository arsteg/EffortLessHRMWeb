import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout-component',
  templateUrl: 'layout-component.component.html',
  styleUrls: ['layout-component.component.css']
})
export class LayoutComponentComponent implements OnInit {
  name = 'Angular 6';
  constructor() { }

  ngOnInit(): void {
  }

}
