import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import AOS from 'aos';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  isHovered: boolean = false;
  isDropdownOpen: boolean = false;
  @ViewChild('aboutUsSection', { static: true }) aboutUsSection: ElementRef;
  @ViewChild('ttFeatures', { static: false }) ttFeatures: ElementRef;
  @ViewChild('hrmFeatures', { static: false }) hrmFeatures: ElementRef;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    AOS.init({ disable: 'mobile' });
    AOS.refresh();

    window.addEventListener('scroll', this.scroll, true)
  }
  ngAfterViewInit() {
    console.log(this.hrmFeatures);
  }

  toggleDropdown(event: MouseEvent): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    event.stopPropagation();
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const dropdown = document.querySelector('.navigation__dropdown-popup') as HTMLElement;

    // Check if the clicked element is not within the dropdown
    if (!dropdown.contains(clickedElement)) {
      this.isDropdownOpen = false; // Close the dropdown
    }
  }

  scrollToAboutUs() {
    if (this.aboutUsSection && this.aboutUsSection.nativeElement) {
      this.aboutUsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('About Us section not found or not yet initialized.');
    }
  }

  scrollTottFeatures() {
    if (this.ttFeatures && this.ttFeatures.nativeElement) {
      this.ttFeatures.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('Time Tracking Features section not found or not yet initialized.');
    }
  }

  scrollToHRMFeatures() {
    if (this.hrmFeatures && this.hrmFeatures.nativeElement) {
      this.hrmFeatures.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('HRM Features section not found or not yet initialized.');
    }
  }
  scroll = (): void => {

    let scrollHeigth;

    if (window.innerWidth < 350) {
      scrollHeigth = 100;
    } else if (window.innerWidth < 500 && window.innerWidth > 350) {
      scrollHeigth = 100;
    } else if (window.innerWidth < 700 && window.innerWidth > 500) {
      scrollHeigth = 100;
    } else if (window.innerWidth < 1000 && window.innerWidth > 700) {
      scrollHeigth = 100;
    } else {
      scrollHeigth = 100;
    }

    if (window.scrollY >= scrollHeigth) {
      document.body.style.setProperty('--navbar-scroll', "white");
      document.body.style.setProperty('--navbar-scroll-text', "black");
      document.body.style.setProperty('--navbar-scroll-shadow', "0 18px 30px rgb(0 0 0 / 3%)");
    }
    else if (window.scrollY < scrollHeigth) {
      document.body.style.setProperty('--navbar-scroll', "transparent");
      document.body.style.setProperty('--navbar-scroll-text', "white");
      document.body.style.setProperty('--navbar-scroll-shadow', "none");
    }
  }

}
