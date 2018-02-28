import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild,
    SimpleChange,
} from '@angular/core';
import { ImageModel } from '../models/image';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import * as JSZipUtils from 'jszip-utils';
import * as _ from 'lodash';
import { LanguageObject } from '../internationalization.constant';

@Component({
    'selector': 'rt-photos',
    'templateUrl': './photos.component.html',
    'styleUrls': ['./photos.component.css']
})

export class PhotosComponent implements OnInit, AfterViewInit, OnChanges {
    public images: any[] = [];
    public selectedImages: any[] = [];
    public dropableElement: any;
    public noOfFiles: number;
    public propertyBaseInfo: any;
    public showLoader: boolean = false;
    private imageLinks: any[] = [];
    public showOverlay: boolean = false;
    public overlayImageSrc: string = '';
    public imageInOverlay: any;
    public imageIndex = -1;
    public deleteImageCount: number = 0;
    public languageObject: object;
    public applySelectAll: boolean = false;
    @ViewChild('chkError') chkError;
    public errorObject: object = {};
    public supportedImageFormats = ['jpg', 'png', 'jpeg'];

    @ViewChild('overlayImage') overlayImage;

    @Input()
    public isAddPolicy: boolean;

    @Input()
    public imagesInput: ImageModel[];

    @Input()
    public imageUrlsAdded: boolean;

    @Input()
    public isMultimediaModule: boolean = false;

    @Input()
    public selectedEntity?: string = null;

    @Output()
    private imageAdded: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    private allImagesSelected: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    private allImagesUnselected: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    private imageSelected: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    private favouriteSelected: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    private imagesDeleted: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    public isReadOnly: boolean = false;

    constructor(private cd: ChangeDetectorRef) {
        this.showLoader = true;
        this.languageObject = LanguageObject;
    }

    ngOnInit() {
        if (this.imagesInput) {
            this.images = _.cloneDeep(this.imagesInput);
        }
        const ref = this;
        _.forEach(this.imagesInput, function (currentImage) {
            if (currentImage['IsDeleted']) {
                ref['deleteImageCount']++;
            }
        });
    }
    ngAfterViewInit() {
        this.showLoader = false;
        this.cd.detach();
        this.cd.detectChanges();
        this.cd.reattach();
        // console.log('inside after view init');
    }
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        // for (const propName in changes) {
        //     if (propName === 'imagesInput') {
        //         this.images = _.cloneDeep(this.imagesInput);
        //         this.cd.detach();
        //         this.cd.detectChanges();
        //         this.cd.reattach();
        //     }
        // }
    }
    public previewFile(files?) {
        this.noOfFiles = 0;
        if (!files) {
            files = document.querySelector('#fileUploadBox')['files'];
        }
        if (files.length > 1) {
            // this.dummyImages = Array(files.length).fill(4);
            this.noOfFiles = files.length;
        }
        const propBaseInfo = this.propertyBaseInfo;
        // const sharedService = this.sharedService;
        const images = this.images;
        const ref = this;
        function readAndPreview(file) {
            const reader = new FileReader();
            reader.addEventListener('load', function () {
                // result = reader.result;
                const currentImage = new ImageModel();
                const img = new Image();
                img.src = reader.result;
                const extension = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);

                if (ref.supportedImageFormats.indexOf(extension) === -1) {
                    ref['errorObject']['ErrorType'] = 'Something wrong happened';
                    ref['errorObject']['ErrorCode'] = '';
                    ref['errorObject']['Description'] = 'Images with Extension .jpg or .png are only allowed';
                    ref['chkError']['nativeElement'].click();
                    return;
                }
                currentImage.Name = file.name.substring(file.name.lastIndexOf('.'), 0);
                currentImage.Description = '';
                // currentImage.Property_UID = propBaseInfo['PropertyId'];
                currentImage.IsDeleted = false;
                currentImage.FileExtension = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
                currentImage.Revision = ref.guid();
                currentImage.IsFavorite = false;
                currentImage.ImageEncoded = reader.result;
                currentImage.ImageData = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
                if (ref['selectedEntity']) {
                    currentImage['EntityType'] = ref['selectedEntity'];
                    // currentImage.ImageEncoded = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
                    // currentImage.ImageData = reader.result;
                    currentImage['NewAdded'] = true;
                }
                // currentImage.ImageData = reader.result;
                currentImage.TrackingId = ref.guid();
                img.onload = function () {
                    // console.log('width', this['width']);
                    if (this['width'] < 250) {
                        document.getElementById('fileUploadBox')['value'] = '';
                        ref['errorObject']['ErrorType'] = 'Something wrong happened';
                        ref['errorObject']['ErrorCode'] = '';
                        ref['errorObject']['Description'] = 'Image Size should be larger than 250 px';
                        ref['chkError']['nativeElement'].click();
                        return false;
                    }
                    currentImage.height = this['height'];
                    currentImage.width = this['width'];
                    document.getElementById('fileUploadBox')['value'] = '';
                    images.push(currentImage);
                    ref.imageAdded.emit(images);
                };
                // console.log(images);
            }, false);

            // reader.onprogress = function (data) {
            //     if (data.lengthComputable) {
            //         let progress: number;
            //         progress = ((data.loaded / data.total) * 100);
            //         console.log(progress);
            //     }
            // };
            reader.readAsDataURL(file);
        }
        if (files) {
            [].forEach.call(files, readAndPreview);
        }

    }

    public selectAllImages() {
        if (this.selectedImages.length > 0 && this.applySelectAll === true) {
            this.unselectAllImages();
            this.applySelectAll = false;
            return;
        }
        if (this.isAddPolicy) {
            this.selectedImages = [];
            for (let i = 0; i < this.images.length; i++) {
                if (!this.images[i]['IsDeleted']) {
                    this.selectedImages.push(this.images[i]['TrackingId']);
                }
            }

        } else {
            this.selectedImages = [];
            for (let i = 0; i < this.images.length; i++) {
                if (!this.images[i]['IsDeleted']) {
                    this.selectedImages.push(this.images[i]['Id']);
                }
            }
        }
        this.applySelectAll = true;
        this.allImagesSelected.emit(this.selectedImages);
    }

    public unselectAllImages() {
        this.selectedImages = [];
        this.allImagesUnselected.emit();
    }

    public setSelectedImages(image, source?: string, action?: string) {
        if (image['Id']) { // this.isAddPolicy
            if (this.selectedImages.indexOf(image.Id) !== -1) {
                this.selectedImages.splice(this.selectedImages.indexOf(image.Id), 1);
                this.applySelectAll = false;
            } else {
                this.selectedImages.push(image.Id);
                if (this.imageUrlsAdded) {
                    this.imageLinks.push(image['ImageData']);
                }
            }
        } else {
            if (this.selectedImages.indexOf(image.TrackingId) !== -1) {
                this.selectedImages.splice(this.selectedImages.indexOf(image.TrackingId), 1);
                this.applySelectAll = false;
            } else {
                this.selectedImages.push(image.TrackingId);
                if (this.imageUrlsAdded) {
                    this.imageLinks.push(image['ImageData']);
                }
            }
        }
        if (action) {
            this.downloadImage();
            return;
        }
        if (this.selectedImages.length === (this.images.length - this.deleteImageCount)) {
            this.applySelectAll = true;
        }
        if (source) {
            this.markAsDeleted(source);
        }
        this.imageSelected.emit(this.selectedImages);
    }

    public setFavouriteImage(image) {
        let favouriteKey = null;
        if (this.isAddPolicy) {
            for (let i = 0; i < this.images.length; i++) {
                if (this.images[i]['TrackingId'] === image['TrackingId']) {
                    if (image['IsFavorite'] !== true) {
                        this.images[i]['IsFavorite'] = true;
                        favouriteKey = image['TrackingId'];
                    } else if (image['IsFavorite'] === true) {
                        this.images[i]['IsFavorite'] = false;
                        favouriteKey = image['TrackingId'];
                    }

                } else {
                    this.images[i]['IsFavorite'] = false;
                    favouriteKey = image['Id'];
                }
            }
        } else {
            for (let i = 0; i < this.images.length; i++) {
                // this.images[i]['IsFavorite'] = false;

                if (this.images[i]['Id'] === image['Id']) {
                    if (image['IsFavorite'] !== true) {
                        this.images[i]['IsFavorite'] = true;
                        favouriteKey = image['Id'];
                    } else if (image['IsFavorite'] === true) {
                        this.images[i]['IsFavorite'] = false;
                        favouriteKey = image['Id'];
                    }

                } else {
                    this.images[i]['IsFavorite'] = false;
                }
            }
        }
        this.isMultimediaModule ? this.favouriteSelected.emit(favouriteKey) : this.favouriteSelected.emit(this.images);
    }

    public downloadImage() {
        const zip = new JSZip();
        const link = document.createElement('a');
        const ref = this;
        let downloaded = false;
        for (let i = 0; i < this.selectedImages.length; i++) {
            for (let j = 0; j < this.images.length; j++) {
                if (this.selectedImages[i] === this.images[j]['Id'] || this.selectedImages[i] === this.images[j]['TrackingId']) {
                    if (this.selectedImages.length > 1) {
                        if (this.images[j].ImageEncoded) {
                            let data = this.images[j].ImageEncoded.replace(/^data:image\/[a-z]+;base64,/, '');
                            let name = this.images[j]['Name'] + '.' + this.images[j]['FileExtension'];
                            if (zip.files) {
                                for (const property in zip.files) {
                                    if (property === name) {
                                        name = this.images[j]['Name'] + '-' + j + '.' + this.images[j]['FileExtension'];
                                    }
                                }
                            }
                            const keys = Object.keys(zip.files).length;
                            zip.file(name, data, { base64: true });
                            data = '';
                            if (keys === this.selectedImages.length && !downloaded) {
                                zip.generateAsync({ type: 'blob' })
                                    .then(function (content) {
                                        downloaded = true;
                                        FileSaver.saveAs(content, 'photos.zip');
                                        ref.unselectAllImages();
                                        ref['applySelectAll'] = false;
                                        return;
                                    });
                            }
                        } else if (this.images[j].ImageLink) {
                            JSZipUtils.getBinaryContent(this.images[j].ImageLink + '&sizeCat=Original', function (error, data) {
                                if (error) {
                                    // console.log('error: ', error);
                                } else {
                                    // console.log('data: ', data);
                                    let name = '';
                                    if (ref.images[j]['Name'].includes('.jpg') || ref.images[j]['Name'].includes('.jpeg') || ref.images[j]['Name'].includes('.png')) {
                                        name = ref.images[j]['Name'];
                                    } else {
                                        name = ref.images[j]['Name'] + '-' + j + '.' + ref.images[j]['FileExtension'];
                                    }
                                    zip.file(name, data, { binary: true });
                                    const keys = Object.keys(zip.files).length;
                                    if (keys === ref.selectedImages.length && !downloaded) {
                                        zip.generateAsync({ type: 'blob' })
                                            .then(function (content) {
                                                downloaded = true;
                                                FileSaver.saveAs(content, 'photos.zip');
                                                ref.unselectAllImages();
                                                ref['applySelectAll'] = false;
                                                return;
                                            });
                                    }
                                }
                            });
                        }

                    } else {
                        let prefix = '';
                        // link.download = this.images[j]['Name'];
                        if (this.images[j]['FileExtension'] === 'jpg' || this.images[j]['FileExtension'] === 'jpeg') {
                            prefix = 'data:image/jpeg;base64,';
                        } else {
                            prefix = 'data:image/png;base64,';
                        }
                        this.images[j].ImageData ? link.href = prefix + this.images[j].ImageData : link.href = this.images[j].ImageLink + '&sizeCat=Original';
                        if (navigator.appVersion.indexOf('Trident') >= 0) {
                            if (!this.images[j].ImageData) {
                                JSZipUtils.getBinaryContent(this.images[j].ImageLink + '&sizeCat=Original', function (error, data) {
                                    // console.log('data: ', data);
                                    const fileData = data;
                                    const blobObject = new Blob([new Uint8Array(data)]);
                                    window.navigator.msSaveBlob(blobObject, ref['images'][j]['Name'] + '-' + j + '.' + ref['images'][j]['FileExtension']);
                                });
                            } else {
                                let contentType = 'image/png';
                                if (this.images[j].ImageData.indexOf('image/jpeg') >= 0) {
                                    contentType = 'image/jpeg';
                                }
                                const byteCharacters = atob(this.images[j].ImageData);
                                const byteArrays = [];
                                const sliceSize = 512;

                                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                                    const slice = byteCharacters.slice(offset, offset + sliceSize);

                                    const byteNumbers = new Array(slice.length);
                                    for (let k = 0; k < slice.length; k++) {
                                        byteNumbers[k] = slice.charCodeAt(k);
                                    }

                                    const byteArray = new Uint8Array(byteNumbers);

                                    byteArrays.push(byteArray);
                                }
                                const blob = new Blob(byteArrays, { type: 'image/jpeg' });
                                window.navigator.msSaveBlob(blob, ref['images'][j]['Name'] + '.' + ref['images'][j]['FileExtension']);
                            }
                        } else {
                            link.setAttribute('href', link.href);
                            link.setAttribute('target', '_blank');
                            link.setAttribute('download', this.images[j]['Name'] + '.' + this.images[j]['FileExtension']);
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                        this.unselectAllImages();
                        return;
                    }
                }
            }
        }
    }

    public activateDropableArea() {
        this.dropableElement = document.querySelector('.droppable');
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('multiple', 'true');
        input.style.display = 'none';

        input.addEventListener('change', this.triggerCallback);
        this.dropableElement.appendChild(input);
    }
    public makeDroppable(event) {
        if (!this.dropableElement) {
            this.activateDropableArea();
        }
        if (event.type === 'dragover') {
            event.preventDefault();
            event.stopPropagation();
            this.dropableElement.classList.add('dragover');
        }

        if (event.type === 'dragleave') {
            event.preventDefault();
            event.stopPropagation();
            this.dropableElement.classList.remove('dragover');
        }

        if (event.type === 'drop') {
            event.preventDefault();
            event.stopPropagation();
            this.dropableElement.classList.remove('dragover');
            // this.dropableElement.nextElementSibling.classList.add('hide');
            this.triggerCallback(event);
        }

    }
    public triggerCallback(e?, callback?) {
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        this.previewFile(files);
    }

    public markAsDeleted(source?: string) {
        const ref = this;
        for (let i = 0; i < this.images.length; i++) {
            for (let j = 0; j < this.selectedImages.length; j++) {
                if (this.images[i]['Id'] === this.selectedImages[j] || this.images[i]['TrackingId'] === this.selectedImages[j]) {
                    this.images[i]['IsDeleted'] = true;
                }
            }
        }
        this.deleteImageCount = 0;
        _.forEach(this.images, function (currentImage) {
            if (currentImage['IsDeleted']) {
                ref['deleteImageCount']++;
            }
        });
        this.isMultimediaModule ? this.imagesDeleted.emit(this.selectedImages) : this.imagesDeleted.emit(this.images);
        if (source) {
            this.nextImage();
        }
        this.unselectAllImages();
        this.applySelectAll = false;
    }

    public openOverlay(image) {
        this.showOverlay = true;
        this.overlayImageSrc = image.ImageEncoded || image.previewLink;
        this.imageInOverlay = image;
    }

    public closeOverlay() {
        this.showOverlay = false;
    }

    public nextImage() {
        const imageId = this.imageInOverlay['Id'] || this.imageInOverlay['TrackingId'];
        let itemIndex = -1;
        for (let i = 0; i < this.images.length; i++) {
            if (this.images[i]['Id'] === imageId || this.images[i]['TrackingId'] === imageId) {
                itemIndex = i;
                this.imageIndex = i;
                break;
            }
        }
        if ((itemIndex + 1) === this.images.length) {
            itemIndex = -1;
        }
        for (let i = itemIndex + 1; i < this.images.length; i++) {
            const nextImage = this.images[i];
            if (nextImage.IsDeleted) {
                if (i === this.images.length - 1) {
                    itemIndex = -1;
                    i = -1;
                }
                continue;
            }
            this.imageInOverlay = nextImage;
            this.overlayImageSrc = nextImage['ImageEncoded'] || nextImage['previewLink'];
            this.imageIndex = i;
            break;
        }

    }

    public previousImage() {
        const imageId = this.imageInOverlay['Id'] || this.imageInOverlay['TrackingId'];
        let itemIndex = -1;
        for (let i = 0; i < this.images.length; i++) {
            if (this.images[i]['Id'] === imageId || this.images[i]['TrackingId'] === imageId) {
                itemIndex = i;
                this.imageIndex = i;
                break;
            }
        }
        for (let i = itemIndex - 1; i >= 0; i--) {
            const nextImage = this.images[i];
            if (nextImage.IsDeleted) {
                continue;
            }
            this.imageInOverlay = nextImage;
            this.overlayImageSrc = nextImage['ImageEncoded'] || nextImage['previewLink'];
            this.imageIndex = i;
            break;
        }
    }

    public checkIdExists(id1, id2) {
        if (this.selectedImages.indexOf(id1) >= 0 || this.selectedImages.indexOf(id2) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    public cancelDelete() {
        this.unselectAllImages();
        this.applySelectAll = false;
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
}
