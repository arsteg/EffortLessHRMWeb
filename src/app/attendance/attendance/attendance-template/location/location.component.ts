import { Component, EventEmitter, Output } from '@angular/core';
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {
  @Output() closeMap: any = new EventEmitter();

  constructor() { }

  closeModal() {
    this.closeMap.emit(true);
  }

}
