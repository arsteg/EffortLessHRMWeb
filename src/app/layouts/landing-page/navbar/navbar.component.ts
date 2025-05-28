import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  private viewportScroller: ViewportScroller = inject(ViewportScroller);
  
  scrollToSection(anchor: string) {
    this.viewportScroller.setOffset([0, 95]);
    this.viewportScroller.scrollToAnchor(anchor);
  }

  downloadWindowsInstaller() {
    const downloadUrl = 'https://github.com/arsteg/ARSTEG.EffortlessHRM.TimeTracker/releases/download/1.0.1/TimeTracker_v1.0.0.0.exe';
    window.location.href = downloadUrl;
  }

}
