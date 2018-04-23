import {Component, OnInit} from '@angular/core';
import {Trip} from '../shared/interface/trip';
import {Destination} from '../shared/interface/destination';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css']
})
export class TripComponent implements OnInit {
  trip: Trip;
  center: google.maps.LatLng;
  infoWindowShown = false;
  marker: any = {
    title: null,
    position: null, // { lat: null, lng: null }
  };

  constructor() {
  }

  ngOnInit() {
    this.trip = {
      title: 'My new trip',
      destinations: []
    };
  }

  clickOnMap (event) {
    if (event instanceof MouseEvent) {
      return false;
    }
    this.addSearchLocationMarker(event.latLng, 'new marker');
  }

  autoCompleteResult(place: google.maps.GeocoderResult) {
    this.center = place.geometry.location;
    this.addSearchLocationMarker(this.center, place.formatted_address);
  }

  toggleInfoWindow({target: marker}) {
    if (!this.infoWindowShown) {
      marker.nguiMapComponent.openInfoWindow('iw', marker);
    } else {
      marker.nguiMapComponent.closeInfoWindow('iw');
    }

    this.infoWindowShown = !this.infoWindowShown;
  }

  addMarkerToTrip(marker) {
    const destination: Destination = {
      lat: marker.position.lat(),
      lng: marker.position.lng(),
      title: marker.title
    };
    this.addDestination(destination);
  }

  private addSearchLocationMarker(latLng: google.maps.LatLng, title = '') {
    this.marker.position = latLng;
    this.marker.title = title;
  }

  private addDestination(destination: Destination) {
    this.trip.destinations.push(destination);
  }
}
