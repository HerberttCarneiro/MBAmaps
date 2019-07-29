import { Component, ViewChild } from '@angular/core';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment,
  GoogleMapsAnimation,
  MyLocation
} from '@ionic-native/google-maps/ngx';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet/ngx';
import { Platform, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map') mapElement: any;
  private loading: any
  private map: GoogleMap
  constructor(
    private launchNavigator: LaunchNavigator,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private actionSheet: ActionSheet) { }

  async ngOnInit() {
    this.mapElement = this.mapElement.nativeElement

    this.mapElement.style.width = `${this.platform.width()}px`
    this.mapElement.style.height = `${this.platform.height()}px`

    await this.loadMap();
  }
  async loadMap() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' })
    await this.loading.present()

    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCNUyqSsBORTLpG74eoH-0dAsxdcERBQAk',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCNUyqSsBORTLpG74eoH-0dAsxdcERBQAk'
    });

    const mapOptions: GoogleMapOptions = {
      controls: {
        zoom: true
      }
    }
    this.map = GoogleMaps.create(this.mapElement, mapOptions);
    try {
      await this.map.one(GoogleMapsEvent.MAP_READY)
      this.addOriginMarker()
    } catch (error) {
      console.log(error);
    }
  }
  async addOriginMarker() {
    try {
      const myLocation: MyLocation = await this.map.getMyLocation()
      await this.map.moveCamera({
        target: myLocation.latLng,
        zoom: 18
      })
      const marker = this.map.addMarkerSync({
        title: `Localização atual`,
        icon: 'red',
        animation: GoogleMapsAnimation.DROP,
        position: myLocation.latLng
      })
      marker.on(GoogleMapsEvent.INFO_OPEN).subscribe(() => {
        this.presentActionSheet()
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.loading.dismiss();
    }
  }
  presentActionSheet() {
    let buttonLabels = ['Abrir no maps'];

    const options: ActionSheetOptions = {
      title: 'Deseja abrir em um app nativo?',
      subtitle: 'Escolha uma opção',
      buttonLabels: buttonLabels,
      addCancelButtonWithLabel: 'Cancelar',
    }

    this.actionSheet.show(options).then((buttonIndex: number) => {
      if (buttonIndex == 1) {
        this.navigate()
      }
    });
  }
  async navigate() {
    const myLocation: MyLocation = await this.map.getMyLocation()
    let options: LaunchNavigatorOptions = {
      start: 'MBA Mobi, St. de Habitações Individuais Sul QI 13 - Lago Sul, Brasília - DF, 71635-130'
    };
    
    this.launchNavigator.navigate([myLocation.latLng.lat, myLocation.latLng.lng], options)
      .then(
        success => console.log('Launched navigator'),
        error => alert(error)
      );
  }
}
