import { Component, OnInit } from '@angular/core';
import AOS from 'aos';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    AOS.init({disable: 'mobile'});
    AOS.refresh();

    window.addEventListener('scroll', this.scroll, true)
  }


  scroll = (): void => {

    let scrollHeigth;
 
    if(window.innerWidth < 350){
     scrollHeigth = 100;
    }else if(window.innerWidth < 500 && window.innerWidth > 350){
     scrollHeigth = 100;
    }else if(window.innerWidth < 700 && window.innerWidth > 500){
     scrollHeigth = 100;
    }else if(window.innerWidth < 1000 && window.innerWidth > 700){
     scrollHeigth = 100;
    }else{
      scrollHeigth = 100;
    }
 
     if(window.scrollY >= scrollHeigth){
       document.body.style.setProperty('--navbar-scroll', "white");
       document.body.style.setProperty('--navbar-scroll-text', "black");
       document.body.style.setProperty('--navbar-scroll-shadow', "0 18px 30px rgb(0 0 0 / 3%)");
     }
     else if(window.scrollY < scrollHeigth){
       document.body.style.setProperty('--navbar-scroll', "transparent");
       document.body.style.setProperty('--navbar-scroll-text', "white");
       document.body.style.setProperty('--navbar-scroll-shadow', "none");
     }
   }

}
