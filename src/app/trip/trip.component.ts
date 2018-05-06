import {Component, ViewChild, OnInit} from '@angular/core';

import {NguiMapComponent, DirectionsRenderer} from '@ngui/map';

import {Trip} from '../shared/interface/trip';
import {Destination} from '../shared/interface/destination';
import {Helpers} from '../shared/helpers';


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

  clickOnMap(event) {
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
      showDirection: true
    };

    if (length > 0) {
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

    if (destination.directionsRequest) { // end of direction
      destination.directionsRequest.destination = {lat: destination.lat, lng: destination.lng};
    }

    this.destinations[destinationIndex] = destination; // need to update the whole instance otherwise change will not be detected

    if (destinationIndex < (this.destinations.length - 1) && this.destinations[destinationIndex + 1]) {
      const nextDestination: Destination = Object.assign({}, this.destinations[destinationIndex + 1]);
      if (nextDestination.directionsRequest) {
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
      if (nextDestination.directionsRequest) {
        // need to update the whole instance otherwise change will not be detected
        const nextDestinationUpdated: Destination = Object.assign({}, this.destinations[destinationIndex + 1]);
        nextDestinationUpdated.directionsRequest.origin = {lat: prevDestination.lat, lng: prevDestination.lng};
        this.destinations[destinationIndex + 1] = nextDestinationUpdated;
      }
    } else if (nextDestination) { // check if we only have destination after
      nextDestination.directionsRequest = null;
    }
    // remove
    this.destinations.splice(destinationIndex, 1);
  }

  changeDestinationPosition(destinationIndex: number, newIndex: number) {
    const oldDestinations: Destination[] = Object.assign([], this.destinations);
    const oldPrevDestination: Destination = oldDestinations[destinationIndex - 1] || null;
    const oldNextDestination: Destination = oldDestinations[destinationIndex + 1] || null;

    // update the old next destination to use direction origin from old prev destination
    if (oldNextDestination) {
      if (oldPrevDestination) {
        // need to clone and reassign the whole directionsRequest object otherwise view wont recognise change
        const directionsRequest = Object.assign({}, this.destinations[destinationIndex + 1].directionsRequest);
        directionsRequest.origin = {lat: oldPrevDestination.lat, lng: oldPrevDestination.lng};
        this.destinations[destinationIndex + 1].directionsRequest = directionsRequest;
      } else {
        this.destinations[destinationIndex + 1].directionsRequest = null;
      }
    }

    let newDestinations: Destination[] = Object.assign([], this.destinations);

    // move destination to new position
    newDestinations = Helpers.moveArrayElement(newDestinations, destinationIndex, newIndex);

    const destination = newDestinations[newIndex];

    const newPrevDestination: Destination = newDestinations[newIndex - 1] || null;
    const newNextDestination: Destination = newDestinations[newIndex + 1] || null;

    // first update the direction origin of the destination to the new prev destination if we have one
    if (newPrevDestination) {
      if (destination.directionsRequest) {
        const directionsRequest = Object.assign({}, destination.directionsRequest);
        directionsRequest.origin = {lat: newPrevDestination.lat, lng: newPrevDestination.lng};
        destination.directionsRequest = directionsRequest;
      } else {
        destination.directionsRequest = {
          origin: {lat: newPrevDestination.lat, lng: newPrevDestination.lng},
          destination: {lat: destination.lat, lng: destination.lng},
          travelMode: (newPrevDestination.directionsRequest ?
            newPrevDestination.directionsRequest.travelMode : google.maps.TravelMode.DRIVING)
        };
      }
    } else {
      destination.directionsRequest = null;
    }

    // check new next destination direction if we need to update direction form current as origin
    if (newNextDestination) {
      if (newNextDestination.directionsRequest) {
        const directionsRequest = Object.assign({}, newNextDestination.directionsRequest);
        directionsRequest.origin = {lat: destination.lat, lng: destination.lng};
        newNextDestination.directionsRequest = directionsRequest;
      } else {
        newNextDestination.directionsRequest = {
          origin: {lat: destination.lat, lng: destination.lng},
          destination: {lat: newNextDestination.lat, lng: newNextDestination.lng},
          travelMode: (destination.directionsRequest ? destination.directionsRequest.travelMode : google.maps.TravelMode.DRIVING)
        };
      }
    }

    this.destinations = newDestinations; // update destinations
  }

  private addSearchLocationMarker(latLng: google.maps.LatLng, title?: string) {
    this.marker = {
      position: latLng,
      title: title || ''
    };
  }

  resetCurrentMarker() {
    this.infoWindowShown = false;
    this.marker = null;
  }
}
