import {Destination} from './destination';

export interface Trip {
  title?: string;
  destinations?: Destination[];
  directions?: Direction[];
}

export interface Direction {
  request: google.maps.DirectionsRequest;
  options?: google.maps.DirectionsRendererOptions;
}
