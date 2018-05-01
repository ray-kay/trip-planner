import {Component, ViewChild, OnInit} from '@angular/core';

import { NguiMapComponent, DirectionsRenderer } from '@ngui/map';

import {Trip} from '../shared/interface/trip';
import {Destination} from '../shared/interface/destination';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.less']
})
export class TripComponent implements OnInit {
  @ViewChild(NguiMapComponent) nguiMapComponent: NguiMapComponent;
  @ViewChild(DirectionsRenderer) directionsRendererDirective: DirectionsRenderer;
  geocoder: google.maps.Geocoder;
  trip: Trip;
  activeDestination: Destination; // selected destination pin
  customMarkers: any[] = [];
  center: google.maps.LatLng;
  infoWindowShown = false;
  marker: any; // = { title: null, position: null} // { lat: null, lng: null };

  constructor() {
  }

  ngOnInit() {
    this.trip = {
      title: 'My new trip',
      destinations: [{
        lat: -33.89440625978433,
        lng: 151.21222767700192,
        order: 1
      }, {
        lat: -33.87,
        lng: 151.25,
        order: 2
      }],
    };
  }

  onMapReady(map) {
    this.geocoder = new google.maps.Geocoder();

    // add directions here as only then we have google available
    this.trip.directions = [{
      origin: { lat: -33.89440625978433, lng: 151.21222767700192 },
      destination: { lat: -33.87, lng: 151.25 },
      travelMode: google.maps.TravelMode.WALKING
    }];
  }

  clickOnMap (event) {
    if (event instanceof MouseEvent) {
      return false;
    }
    // aways close info window for destination markers
    this.nguiMapComponent.closeInfoWindow('destinationInfoWindow');
    this.addSearchLocationMarker(event.latLng, 'new marker');
  }

  autoCompleteResult(place: google.maps.GeocoderResult) {
    this.center = place.geometry.location;
    this.addSearchLocationMarker(this.center, place.formatted_address);
  }

  toggleInfoWindow({target: marker}) { // {target: marker} = event.target
    if (!this.infoWindowShown) {
      this.nguiMapComponent.openInfoWindow('markerInfoWindow', marker);
    } else {
      this.nguiMapComponent.closeInfoWindow('markerInfoWindow');
    }

    this.infoWindowShown = !this.infoWindowShown;
  }

  clickDestinationMarker(event, customMarkerIndex: number, destination: Destination) {
    event.stopImmediatePropagation();
    this.activeDestination = destination;
    this.nguiMapComponent.openInfoWindow('destinationInfoWindow', this.customMarkers[customMarkerIndex]);
  }

  addMarkerToTrip(marker) {
    const destination: Destination = {
      lat: marker.position.lat(),
      lng: marker.position.lng(),
      order: this.trip.destinations.length + 1,
      title: marker.title,
      fullAddress: ''
    };
    this.addDestination(destination);
    /*
    const self = this;
    this.geocoder.geocode({'location': {lat: marker.position.lat(), lng: marker.position.lng()}}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          console.log(results[0]);
          const destination: Destination = {
            lat: marker.position.lat(),
            lng: marker.position.lng(),
            order: this.trip.destinations.length + 1,
            title: marker.title,
            fullAddress: results[0].formatted_address
          };
          self.addDestination(destination);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });*/
  }

  private addSearchLocationMarker(latLng: google.maps.LatLng, title = '') {
    this.marker = {
      position: latLng,
      title: title
    };
  }

  resetCurrentMarker() {
    this.infoWindowShown = false;
    this.marker = null;
  }

  private addDestination(destination: Destination) {
    this.resetCurrentMarker();
    this.trip.destinations.push(destination);

    if (this.trip.destinations.length > 1) {
      const lastDest = this.trip.destinations[this.trip.destinations.length - 2];
      const direction: google.maps.DirectionsRequest = {
        origin: { lat: lastDest.lat, lng: lastDest.lng}, // lastDest.fullAddress,
        destination: { lat: destination.lat, lng: destination.lng}, // destination.fullAddress,
        travelMode: google.maps.TravelMode.WALKING
      };

      this.trip.directions.push(direction);
    }
  }
}
