import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  hasScroll = false;

  ngAfterViewInit() {
    this.checkForOverflow();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkForOverflow();
  }

  private checkForOverflow() {
    const el = this.scrollContainer.nativeElement;
    this.hasScroll = el.scrollWidth > el.clientWidth;
  }
}
