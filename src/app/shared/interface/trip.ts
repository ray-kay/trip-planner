import {Destination} from './destination';

export interface Trip {
  title?: string;
  destinations?: Destination[];
  directions?: google.maps.DirectionsRequest[];
}
