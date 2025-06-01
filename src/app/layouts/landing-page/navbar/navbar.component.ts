import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  private viewportScroller: ViewportScroller = inject(ViewportScroller);
  dialog = inject(MatDialog);
  
  scrollToSection(anchor: string) {
    this.dialog.closeAll();
    setTimeout(() => {
      this.viewportScroller.setOffset([0, 95]);
      this.viewportScroller.scrollToAnchor(anchor);
    }, 100);
  }

  downloadWindowsInstaller() {
     this.dialog.closeAll();
    const downloadUrl = 'https://github.com/arsteg/ARSTEG.EffortlessHRM.TimeTracker/releases/download/1.0.1/TimeTracker_v1.0.0.0.exe';
    window.location.href = downloadUrl;
  }

}
