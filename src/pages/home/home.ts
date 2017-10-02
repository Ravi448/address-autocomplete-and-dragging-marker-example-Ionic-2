import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import {Geolocation} from '@ionic-native/geolocation';

declare var google;
var latLng;
var markersArray = [];
var loader;
var geocoder;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapChild:ElementRef;
  @ViewChild('input') inputChild:HTMLInputElement;

  latitude:any;
  longitude:any;
  maps:any;

  LastLat:any;
  LastLng:any;
  result:any;

  constructor(
      public navCtrl: NavController,
      private loadingCtrl:LoadingController,
      private geolocation:Geolocation,
    ) {
      geocoder = new google.maps.Geocoder();
      loader = this.loadingCtrl.create({
        spinner:'dots'
      });
      loader.present();
      this.geolocation.getCurrentPosition({enableHighAccuracy:true}).then((res)=>{
        loader.dismiss();
        this.latitude = res.coords.latitude;
        this.longitude = res.coords.longitude;
        this.renderMap();
      });

      setInterval(()=>{
        console.log(this.result);
      },2000);
  }

  ionViewDidLoad(){
    // this.renderMap();
  }

  renderMap() {
    latLng = new google.maps.LatLng(this.latitude,this.longitude);
    this.setCenter(latLng);
    this.dropMarker(latLng);
    this.autocomplete();

  }

  autocomplete(){
    let input = document.getElementById('input');
    console.log(input);
    let autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.maps);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        console.log(place);
        this.setCenter({lat:place.geometry.location.lat(),lng:place.geometry.location.lng()});
        this.dropMarker({lat:place.geometry.location.lat(),lng:place.geometry.location.lng()});
      }else{
        alert('Sorry, Google could not find any place with '+input);
      }
    });
  }

  setCenter(latLng){
    let mapOptions = {
      center:latLng,
      zoom:17,
      mapType:google.maps.MapTypeId.ROADMAP
    }
    this.maps = new google.maps.Map(this.mapChild.nativeElement,mapOptions);
  }

  dropMarker(latLng){
    let markers = new google.maps.Marker({
      map:this.maps,
      position:latLng,
      animation: google.maps.Animation.DROP,
      draggable:true,
      icon:'assets/icon/map-pin.png'
    });
    markersArray.push(markers);
    this.lastLatLng(markers);
  }

  lastLatLng(marker){
    google.maps.event.addListener(marker, 'dragend', () =>{
      geocoder.geocode({latLng: marker.getPosition()},(responses)=>{
        this.result =  responses[0];
      });
    });
  }

}
