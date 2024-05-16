import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { GoogleMapsLoaderService } from './google-maps-loader.service';
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {
  @Output() closeMap: any = new EventEmitter();
  display: any;
  center: google.maps.LatLngLiteral;
  zoom = 6;

  constructor() {}

  ngOnInit(): void {
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        () => {
          console.log('Location access denied.');
          this.center = { lat: 22.2736308, lng: 70.7512555 };
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      this.center = { lat: 22.2736308, lng: 70.7512555 };
    }
  }
 
  moveMap(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.center = (event.latLng.toJSON());
  }
  
  move(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.display = event.latLng.toJSON();
  }
  
  closeModal() {
    this.closeMap.emit(true);
  }

}
