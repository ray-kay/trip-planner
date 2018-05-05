import {Component, ViewChild, OnInit} from '@angular/core';

import { NguiMapComponent, DirectionsRenderer } from '@ngui/map';

import {Trip, Direction} from '../shared/interface/trip';
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
    // default test data
    this.trip = {
      title: 'My new trip',
      destinations: [{
        lat: -33.89440625978433,
        lng: 151.21222767700192,
        order: 1,
        directionOriginIndex: 0
      }, {
        lat: -33.87,
        lng: 151.25,
        order: 2,
        directionDestinationIndex: 0
      }],
    };
  }

  onMapReady(map) {
    this.geocoder = new google.maps.Geocoder();

    // add directions here as only then we have google available
    this.trip.directions = [{
      request: {
        origin: {lat: -33.89440625978433, lng: 151.21222767700192},
        destination: {lat: -33.87, lng: 151.25},
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      }
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

  clickDestinationMarker({target: marker}, destination: Destination) {
    this.activeDestination = destination;
    this.nguiMapComponent.openInfoWindow('destinationInfoWindow', marker);
  }

  destinationMarkerDragEnd(event, destinationIndex: number) {
    const destination: Destination = Object.assign({}, this.trip.destinations[destinationIndex]);
    destination.lat = event.latLng.lat();
    destination.lng = event.latLng.lng();

    this.trip.destinations[destinationIndex] = destination; // need to update the whole instance otherwise change will not be detected

    // find direction and update it

    if (Number.isInteger(destination.directionOriginIndex)) {
      const newDirection: Direction = Object.assign({}, this.trip.directions[destination.directionOriginIndex]);
      newDirection.request.origin = {lat: destination.lat, lng: destination.lng};
      this.trip.directions[destination.directionOriginIndex] = newDirection; // update whole instance otherwise change will not be detected
    }

    if (Number.isInteger(destination.directionDestinationIndex)) {
      const newDirection: Direction = Object.assign({}, this.trip.directions[destination.directionDestinationIndex]);
      newDirection.request.destination = {lat: destination.lat, lng: destination.lng};
      this.trip.directions[destination.directionDestinationIndex] = newDirection;
    }
  }

  removeDestination(destination: Destination) {
    const destinations = Object.assign([], this.trip.destinations);
    const directions = Object.assign([], this.trip.directions);
    const length = destinations.length;
    const index = destination.order - 1;

    const prevDestination: Destination = destinations[index - 1] || null;
    const nextDestination: Destination = destinations[index + 1] || null;

    // update directions if set
    // check if we have a next destination
    for (let i = index; i < length; i++) {
      destinations[i].order--;
    }

    if (Number.isInteger(destination.directionOriginIndex)) {
      directions.splice(destination.directionOriginIndex, 1);
    }

    if (Number.isInteger(destination.directionDestinationIndex)) {
      directions.splice(destination.directionDestinationIndex, 1);
    }

    if (nextDestination && Number.isInteger(nextDestination.directionDestinationIndex)) {
      destinations[index + 1].directionDestinationIndex = null;
    }

    if (prevDestination && Number.isInteger(prevDestination.directionOriginIndex)) {
      destinations[index - 1].directionOriginIndex = null;
    }

    destinations.splice(index, 1);
    this.trip.destinations = destinations;
    this.trip.directions = directions;
    console.log('destinations', destinations);
    console.log('directions', directions);

    this.nguiMapComponent.closeInfoWindow('destinationInfoWindow');
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
      const newDirectionIndex = this.trip.directions.length;

      const lastDest = this.trip.destinations[this.trip.destinations.length - 2];
      lastDest.directionOriginIndex = newDirectionIndex;

      // dest 0 -> 1 (lastDest -> destination)
      lastDest.directionOriginIndex = newDirectionIndex; // set 0 as org
      destination.directionDestinationIndex = newDirectionIndex; // set 1 dest

      // dest 0 -> 1 -> 2 ( = lastDest (1) need destination, 2

      const direction: Direction = {
        request: {
          origin: {lat: lastDest.lat, lng: lastDest.lng}, // lastDest.fullAddress,
          destination: {lat: destination.lat, lng: destination.lng}, // destination.fullAddress,
          travelMode: google.maps.TravelMode.DRIVING
        }
      };

      this.trip.directions.push(direction);
    }
  }
}
