import { Pipe, PipeTransform } from '@angular/core';
import {Destination} from '../shared/interface/destination';

@Pipe({
  name: 'destinationsDirection',
  pure: false
})
export class DestinationsDirectionPipe implements PipeTransform {
  transform(destinations: Destination[], args?: any): any[] {
    return destinations.filter(destination => destination.showDirection && destination.directionsRequest);
  }
}
