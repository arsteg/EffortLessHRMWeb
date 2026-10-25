import { Component, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  hasScroll = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Deferred so the hasScroll update lands in its own change-detection pass
    // instead of mutating a template-bound value right after this view was checked (NG0100).
    Promise.resolve().then(() => this.checkForOverflow());
  }

  @HostListener('window:resize')
  onResize() {
    this.checkForOverflow();
  }

  private checkForOverflow() {
    if (!this.scrollContainer) {
      return;
    }
    const el = this.scrollContainer.nativeElement;
    this.hasScroll = el.scrollWidth > el.clientWidth;
    this.cdr.markForCheck();
  }
}
