/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  Injectable
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types

import { Subscription } from "rxjs";
import { FirebaseService, Club } from "src/app/services/database/firebase";
import { FirebaseMockService } from "src/app/services/database/firebase-mock";

import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Locate from "@arcgis/core/widgets/Locate.js";

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import RouteParameters from "@arcgis/core/rest/support/RouteParameters";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import * as route from "@arcgis/core/rest/route";
import Color from "@arcgis/core/Color";
import LineSymbol from "@arcgis/core/symbols/LineSymbol.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import { CallingFunctionsService } from "src/app/services/comunication/calling-functions.service";
import { MatDialog } from "@angular/material/dialog";
import { AddClubComponent } from "../add-club/add-club.component";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Legend from '@arcgis/core/widgets/Legend';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import Home from "@arcgis/core/widgets/Home";
import Viewpoint from "@arcgis/core/Viewpoint.js";


@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy {
  // The <div> where we will place the map
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  // Instances
  map: esri.Map;
  view: esri.MapView;
  currentPointGraphic: esri.Graphic;
  graphicsLayer: esri.GraphicsLayer;

  // Attributes
  zoom = 10;
  center: Array<number> = [26.096306, 44.439663];
  basemap = "streets-vector";
  loaded = false;
  pointCoords: number[] = [-118.73682450024377, 34.07817583063242];
  dir: number = 0;
  count: number = 0;
  timeoutHandler = null;
  userLocation = null;
  isSelected = false;
  routeGraphic = null;
  selectingNewClub = false;

  // Clubs info
  clubName = "No club selected";
  isFav: boolean;
  favFilter: boolean = false;

  // firebase sync
  isConnected: boolean = false;
  subscriptionList: Subscription;
  subscriptionObj: Subscription;

  private subscription: Subscription;
  private subscription2: Subscription;
  private subscription3: Subscription;
  private subscription4: Subscription;

  constructor(
    private fbs: FirebaseService,
    private call: CallingFunctionsService,
    private dialog: MatDialog
  ) { 
    this.isSelected = false;

    this.subscription = this.call.triggerAddClub$.subscribe(() => {
      this.activateAddClub();
    });

    this.subscription2 = this.call.triggerGetFav$.subscribe(() => {
      console.log("triggerGetFav$ subscription triggered");
      this.showFav();
    });

    this.subscription3 = this.call.triggerRenderAllClubs$.subscribe(() => {
      this.renderAllClubs();
    });

    this.subscription4 = this.call.triggerSetFilterState$.subscribe(state => {
      this.setFav(state);
      console.log(this.favFilter);
    });

  }

  async initializeMap() {
    try {

      // Configure the Map
      const mapProperties: esri.WebMapProperties = {
        basemap: this.basemap
      };

      Config.apiKey = "AAPK0e5bbab4c2f34a9685ebda2734365224VZboPI5X_G5LJH4zcRgFUBNL1A4HnNWPdEe7hOdJBrlMxe2-IGd2EY2xVNBoCGlC";

      this.map = new WebMap(mapProperties);

      this.addFeatureLayers();
      this.addGraphicLayers();

      // Initialize the MapView
      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map
      };

      this.view = new MapView(mapViewProperties);


      // Set up click event listener
      this.view.on('click', (event) => {
        this.view.hitTest(event).then((response) => {
          // Assert the correct type for the hitTest result
          const hit = response.results[0] as any;
      
          if ((hit.graphic !== this.routeGraphic) && hit.graphic.attributes.name) {
            this.handlePointClick(hit.graphic);
          }
          else {
            console.log(this.selectingNewClub);
            if (this.selectingNewClub === true) {
              const mapPoint = this.view.toMap(event);
              console.log("Latitude: " + mapPoint.latitude + ", Longitude: " + mapPoint.longitude);
              this.addClub(mapPoint);
              this.selectingNewClub = false;
              this.changeCursor();
            }
          }
        }
        );
      });

      await this.view.when(); // wait for map to load
      console.log("ArcGIS map loaded");
      console.log("Map center: " + this.view.center.latitude + ", " + this.view.center.longitude);

      this.addWidgets();

      this.connectFirebase();

      return this.view;
    } catch (error) {
      console.log("EsriLoader: ", error);
    }
  }

  addWidgets() {
    const markerSymbol = {
      type: "simple-marker",
      color: [30, 144, 255], // A shade of purple
      size: 20, // Increased size
      outline: {
        color: [250, 250, 250], // Light grey for contrast
        width: 2
      },
    };

    let locateWidget = new Locate({
      view: this.view,   // Attaches the Locate button to the view
      graphic: new Graphic({
        symbol: markerSymbol  // overwrites the default symbol used for the
      })
    });

    let point;

    locateWidget.on("locate", (locateEvent) => {
      // Store the located point
      point = new Point({
        longitude: locateEvent.position.coords.longitude,
        latitude: locateEvent.position.coords.latitude
      });
      const pointGraphic = new Graphic({
        geometry: point, // use the coordinate from the locate event
        symbol: markerSymbol
      });
      this.userLocation = pointGraphic;
      console.log("User's Location: ", this.userLocation);
    });
    
    this.view.ui.add(locateWidget, "top-right");

    const homeViewpoint = new Viewpoint({
      targetGeometry: new Point({
        longitude: this.center[0],
        latitude: this.center[1]
      }),
      scale: 200000
    });
    
    // Create the Home widget with the custom viewpoint
    const homeWidget = new Home({
      view: this.view,
      viewpoint: homeViewpoint
    });
    
    // Add the Home widget to the top-left corner of the view
    this.view.ui.add(homeWidget, "top-left");
  }

  getRoute() {
    if (this.userLocation) {
      const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

      console.log(this.userLocation, this.currentPointGraphic)

      const routeParams = new RouteParameters({
        stops: new FeatureSet({
          features: [this.userLocation, this.currentPointGraphic]
        }),

      });

      const lineSymbol = new SimpleLineSymbol({
        color: [150, 19, 137], // RGB color values
        width: 4, // width of the line
        style: "short-dot"
      });

      const routeGraphics = this.view.graphics.filter(graphic => graphic.symbol && graphic.symbol.type === "simple-line");
      routeGraphics.forEach(graphic => this.view.graphics.remove(graphic));

      route.solve(routeUrl, routeParams)
      .then((data) => {
        data.routeResults.forEach((result) => {
          result.route.symbol = lineSymbol;
          this.view.graphics.add(result.route);
          this.routeGraphic = result.route;
        });
      }).catch((error) => {
        console.error("Routing error: ", error);
      });
    }
    else alert("Please activate your current location");
  }

  addGraphicLayers() {
    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);
  }

  addFeatureLayers() {
    // Trailheads feature layer (points)
    // var trailheadsLayer: __esri.FeatureLayer = new FeatureLayer({
    //   url:
    //     "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0"
    // });

    // this.map.add(trailheadsLayer);

    const clubSymbol = {
      type: "simple-marker",
      color: [102, 51, 153],
      size: 20,
      outline: {
        color: [250, 250, 250],
        width: 2
      },
      style: "diamond"
    }

    const markerSymbol = {
      type: "simple-marker",
      color: [30, 144, 255], // A shade of purple
      size: 20, // Increased size
      outline: {
        color: [250, 250, 250], // Light grey for contrast
        width: 2
      },
    };

    // trailheadsLayer.when(() => {
    //   const legend = new Legend({
    //     view: this.view,
    //     layerInfos: [{
    //       layer: trailheadsLayer,
    //       title: "Trailheads" // Adjust the title as needed
    //     }]
    //   });
    
    //   this.view.ui.add(legend, "bottom-right");
    // });

    const renderer = new UniqueValueRenderer({
      field: "type", // This is a placeholder field name
      uniqueValueInfos: [
        {
          value: "type1",
          symbol: clubSymbol,
          label: "Clubs" // Label as it should appear in the legend
        },
        {
          value: "type2",
          symbol: markerSymbol,
          label: "Current location"
        }
      ]
    });

    const legendLayer = new FeatureLayer({
      source: [], // Empty source as this is just for legend
      fields: [{ name: "type", type: "string" }], // Placeholder field
      objectIdField: "ObjectID",
      renderer: renderer,
      geometryType: "point", // Adjust based on your symbol type
    });

    this.map.add(legendLayer);

    legendLayer.when(() => {
      const legend = new Legend({
        view: this.view,
        layerInfos: [{
          layer: legendLayer,
          title: "Legend" // Adjust the title as needed
        }]
      });
    
      console.log(legend.declaredClass);

      this.view.ui.add(legend, "bottom-right");
    });

  }

  addPoint(item) {  
    let point = new Point({
      longitude: item.lng,
      latitude: item.lat
    });

    const clubSymbol = {
      type: "simple-marker",
      color: [102, 51, 153],
      size: 20,
      outline: {
        color: [250, 250, 250],
        width: 2
      },
      style: "diamond"
    }

    let pointGraphic: esri.Graphic = new Graphic({
      geometry: point,
      symbol: clubSymbol
    });

    pointGraphic.attributes = item;

    this.graphicsLayer.add(pointGraphic);
  }

  handlePointClick(graphic) {
    this.currentPointGraphic = graphic;
    this.isSelected = true;
    this.checkClubFav(graphic);
  }

  activateAddClub() {
    console.log("select a point on the map!");
    this.selectingNewClub = true;
    this.changeCursor();
    console.log(this.selectingNewClub);
  }

  addClub(point) {
    this.dialog.open(AddClubComponent, {
      panelClass: 'custom-popup', 
      backdropClass: 'backdropBackground', 
      data: { point: point }
    });
  }

  changeCursor() {
    if (this.selectingNewClub)
    this.mapViewEl.nativeElement.style.cursor = "crosshair";
    else this.mapViewEl.nativeElement.style.cursor = "default";
  }

  addToFav() {
    const currentUser = this.fbs.getCurrentUserValue();
    if (currentUser) {
      let email = currentUser.email;
      if (email !== null) {
        this.fbs.addToFav(email, this.currentPointGraphic.attributes);
      }
    } else alert("Please log in to add clubs to your favorites.")
  }

  removeFromFav() {
    let email = this.fbs.getCurrentUserValue().email;
      if (email !== null) {
        this.fbs.removeFromFav(email, this.currentPointGraphic.attributes);
      }
  }

  showFav() {
    let email = this.fbs.getCurrentUserValue().email;
    let favList = this.fbs.getFavList(email).subscribe((items: Club[]) => {
      if (this.favFilter) {
        console.log("show fav");
        this.graphicsLayer.removeAll();
        this.view.graphics.removeAll();
        for (let item of items) {
          this.addPoint(item);
        }
      }
    });
  }

  setFav(val: boolean) {
    this.favFilter = val;
  }

  checkClubFav(point) {
    const currentUser = this.fbs.getCurrentUserValue();
    if (currentUser) {
      let email = currentUser.email;
      if (email) {
        let favList = this.fbs.getFavList(email).subscribe((items: Club[]) => {
          for (let item of items) {
            if (item.name === point.attributes.name) {
              this.isFav = true;
              break;
            }
            this.isFav = false;
          }
        });
      } else this.isFav = false;
    } else this.isFav = false;
  }

  renderAllClubs() {
    this.subscriptionList = this.fbs.getChangeFeedList().subscribe((items: Club[]) => {
      this.graphicsLayer.removeAll();
      for (let item of items) {
        this.addPoint(item);
      }
    });
  }

  connectFirebase() {
    console.log(this.isConnected)
    if (this.isConnected) {
      return;
    }
    this.isConnected = true;
    this.fbs.connectToDatabase();
    this.subscriptionList = this.fbs.getChangeFeedList().subscribe((items: Club[]) => {
      console.log("got new items from list: ", items);
      this.graphicsLayer.removeAll();
      for (let item of items) {
        this.addPoint(item);
      }
    });
    this.subscriptionObj = this.fbs.getChangeFeedObj().subscribe((stat: Club[]) => {
      console.log("item updated from object: ", stat);
    });
  }

  disconnectFirebase() {
    if (this.subscriptionList != null) {
      this.subscriptionList.unsubscribe();
    }
    if (this.subscriptionObj != null) {
      this.subscriptionObj.unsubscribe();
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    console.log("initializing map");
    this.initializeMap().then(() => {
      // The map has been initialized
      console.log("mapView ready: ", this.view.ready);
      this.loaded = this.view.ready;
    });
  }

  ngOnDestroy() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
    this.disconnectFirebase();
  }
}
