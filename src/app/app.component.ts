import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit} from 'ng-http-loader';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
 

  constructor(private router:Router){}
  ngOnInit() {

  }

  isChatbotOpen = false;

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
  }
}