import { Component, OnInit } from '@angular/core';
import { imagesArray } from '../images.constant';
@Component({
    'selector': 'rt-photos-demo',
    'templateUrl': './photos-demo.component.html'
})
export class PhotosDemoComponent implements OnInit {
    public images: object[] = imagesArray;
    public imagesInput: object[] = imagesArray;
    public selectedImages: object[] = [];
    public isReadOnly: boolean = false;
    constructor() {

    }
    ngOnInit() {
    }

    public handleImageAdded(images) {
    this.images = images;
    this.imagesInput = images;
    // console.log('Inside handle Image add: ', this.images);
  }

  public handleSelectAll(event) {
    this.selectedImages = event;
  }

  public handleUnselectAll() {
    this.selectedImages = [];
  }

  public handleImageSelected(event) {
    this.selectedImages = [];
    this.selectedImages = event;
    // console.log('Image selected: ', this.selectedImages);
  }

  public handleMainImage(event) {
    this.images = [];
    this.images = event;
    this.imagesInput = event;
  }

  public handleImageDelete(event) {
    this.images = [];
    this.images = event;
    this.imagesInput = event;
    // console.log(this.images);
  }
}
