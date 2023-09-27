import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-Category',
  templateUrl: './leave-category.component.html',
  styleUrls: ['./leave-category.component.css']
})
export class LeaveCategoryComponent implements OnInit {
  searchText: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
