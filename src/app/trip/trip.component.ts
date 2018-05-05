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
  tripTitle: string;
  destinations: Destination[];
  activeDestination: Destination; // selected destination pin
  activeDestinationIndex: number;
  center: google.maps.LatLng;
  infoWindowShown = false;
  marker: any; // = { title: null, position: null} // { lat: null, lng: null };

  constructor() {
  }

  ngOnInit() {
    this.tripTitle = 'My new trip';
    this.destinations = [];
  }

  onMapReady(map) {
    this.geocoder = new google.maps.Geocoder();

    // add directions here as only then we have google available - TODO test data
    this.addDestination(-33.89440625978433, 151.21222767700192);
    this.addDestination(-33.87, 151.25);
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

  addDestination(lat: number, lng: number, title?: string) {
    const length = this.destinations.length;
    const destination: Destination = {
      lat: lat,
      lng: lng,
      title: title || '',
      fullAddress: '',
      showDirection: length > 0
    };

    if (destination.showDirection) {
      const prevDest = this.destinations[length - 1];
      destination.directionsRequest = {
        origin: {lat: prevDest.lat, lng: prevDest.lng},
        destination: {lat: destination.lat, lng: destination.lng},
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      };
    }

    this.resetCurrentMarker();
    this.destinations.push(destination);
    /*
    const self = this;
    this.geocoder.geocode({'location': {lat: marker.position.lat(), lng: marker.position.lng()}}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          console.log(results[0]);
          const destination: Destination = {
            lat: marker.position.lat(),
            lng: marker.position.lng(),
            index: this.trip.destinations.length + 1,
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

  clickDestinationMarker({target: marker}, destinationIndex: number) {
    this.activeDestination = this.destinations[destinationIndex];
    this.activeDestinationIndex = destinationIndex;
    this.nguiMapComponent.openInfoWindow('destinationInfoWindow', marker);
  }

  destinationMarkerDragEnd(event, destinationIndex: number) {
    const destination: Destination = Object.assign({}, this.destinations[destinationIndex]);
    destination.lat = event.latLng.lat();
    destination.lng = event.latLng.lng();

    if (destination.showDirection) { // end of direction
      destination.directionsRequest.destination = {lat: destination.lat, lng: destination.lng};
    }

    this.destinations[destinationIndex] = destination; // need to update the whole instance otherwise change will not be detected

    if (destinationIndex < (this.destinations.length - 1) && this.destinations[destinationIndex + 1]) {
      const nextDestination: Destination = Object.assign({}, this.destinations[destinationIndex + 1]);
      if (nextDestination.showDirection && nextDestination.directionsRequest) {
        nextDestination.directionsRequest.origin = {lat: destination.lat, lng: destination.lng};
        this.destinations[destinationIndex + 1] = nextDestination;
      }
    }
  }

  removeDestination(destinationIndex: number) {
    const prevDestination: Destination = this.destinations[destinationIndex - 1] || null;
    const nextDestination: Destination = this.destinations[destinationIndex + 1] || null;

    // check if we have destination before & after
    if (prevDestination && nextDestination) {
      if (nextDestination.showDirection && nextDestination.directionsRequest) {
        // need to update the whole instance otherwise change will not be detected
        const nextDestinationUpdated: Destination = Object.assign({}, this.destinations[destinationIndex + 1]);
        nextDestinationUpdated.directionsRequest.origin = {lat: prevDestination.lat, lng: prevDestination.lng};
        this.destinations[destinationIndex + 1] = nextDestinationUpdated;
      }
    } else if (nextDestination) { // check if we only have destination after
      nextDestination.showDirection = false;
      nextDestination.directionsRequest = null;
    }
    // remove
    this.destinations.splice(destinationIndex, 1);
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
}
