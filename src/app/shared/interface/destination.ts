export interface Destination {
  lat: number;
  lng: number;
  order: number;
  title?: string;
  fullAddress?: string;
  directionOriginIndex?: number;
  directionDestinationIndex?: number;
}
