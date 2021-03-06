import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import {environment} from '../../environments/environment';

import { TripComponent } from './trip.component';

import { NguiMapModule} from '@ngui/map';
import { DestinationsDirectionPipe } from './destinations-direction.pipe';

@NgModule({
  imports: [
    CommonModule,
    NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?libraries=places&key=' + environment.googleMapsApiKey})
  ],
  declarations: [TripComponent, DestinationsDirectionPipe]
})
export class TripModule { }
