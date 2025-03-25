import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {
  view= localStorage.getItem('adminView');
  constructor() { }

  ngOnInit(): void {
  }
}
