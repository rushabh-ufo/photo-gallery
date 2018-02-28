import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService implements OnInit {
  // OtherSettings Screen
  public userPermissions: BehaviorSubject<any[]> = new BehaviorSubject([]);

  public userAccessLevel: any;
  public userAccessObject: any = {};
  public userBaseLanguageId: number;
  public countryList: object[];
  public stateList: object[];
  public cityList: object[];
  public zoneList: object[];
  public publicPlaceTypes: object[];
  public currencyList: object[];
  public languageList: object[];
  public timeZoneList: object[];

  /**
   * TO-DO: below object should be populated by an API for hotel's base information once it is available
   */
  hotelBasicInfo: object = {
  };

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  performTranslateRequest(translatedName, params: object) {
    const url = 'https://translation.googleapis.com/language/translate/v2?key=AIzaSyDPa5BhvIbbVoOSSS_jqhLhjpP9nEMWGVQ&q=' + translatedName ;
    return this.http.post(url, params);
  }

  performTranslateRequestForCategory(params: object) {
    const url = 'https://translation.googleapis.com/language/translate/v2?key=AIzaSyDPa5BhvIbbVoOSSS_jqhLhjpP9nEMWGVQ';
    return this.http.post(url, params);
  }

  performRequest(method: string, url: string, params?: object) {

  }

  public performRequestWithProgress(method: string, url: string, params?: object) {

    // const authHeader = this.authService.getAuthorizationHeaderValue();
    // const headers = new HttpHeaders().set('Authorization', authHeader);
    // // headers.append('Content-Type', 'multipart/form-data');
    // const apiUrl = appUrls.baseUrlV2 + url;
    // const req = new HttpRequest(method, apiUrl, params, {
    //   reportProgress: true,
    //   headers
    // });
    // return this.http.request(req);
  }

}
