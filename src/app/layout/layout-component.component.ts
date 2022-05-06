import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-layout-component',
  templateUrl: 'layout-component.component.html',
  styleUrls: ['layout-component.component.css']
})
export class LayoutComponentComponent implements OnInit {
  name = 'Angular 6';
  constructor(private route: ActivatedRoute,
    private router: Router,) {
      debugger;
      if(!localStorage.getItem('currentUser')){
         this.router.navigate(['/login']);
      }
     }

  ngOnInit(): void {
  }

}
