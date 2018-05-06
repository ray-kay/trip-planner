import { Pipe, PipeTransform } from '@angular/core';
import {Destination} from '../shared/interface/destination';

@Pipe({
  name: 'destinationsDirection',
  // pure: true
})
export class DestinationsDirectionPipe implements PipeTransform {
  transform(destinations: Destination[], args?: any): any[] {
    console.log('filter');
    return destinations.filter(function (destination: Destination, index: number, array: Destination[]): boolean {
      if (destination.showDirection && index > 0) {
        destination.directionsRequest = {
          origin: {lat: array[index - 1].lat, lng: array[index - 1].lng},
          destination: {lat: destination.lat, lng: destination.lng},
          travelMode: google.maps.TravelMode.DRIVING
        };
        return true;
      }
      destination.directionsRequest = null;
      return false;
    });
  }

  transformOld(destinations: Destination[], args?: any): any[] {
    return destinations.filter(destination => destination.showDirection && destination.directionsRequest);
  }
}
