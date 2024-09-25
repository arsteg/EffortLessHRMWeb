import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pending-application',
  templateUrl: './pending-application.component.html',
  styleUrl: './pending-application.component.css'
})


export class PendingApplicationComponent {
  actionOptions = {
    approve: true,
    reject: true,
    delete: true,
    view: true
  };

 @Input() selectedTab: number;

 ngOnInit(){
 }

}