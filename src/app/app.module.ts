import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PhotosComponent } from './photos/photos.component';
import { PhotosDemoComponent } from './photos-demo/photos-demo.component';

@NgModule({
  declarations: [
    AppComponent,
    PhotosComponent,
    PhotosDemoComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
