import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types

import Map from '@arcgis/core/Map';
import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import * as route from "@arcgis/core/rest/route.js";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})

export class MapComponent{}
// export class MapComponent implements OnInit {
//   @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;

//   map!: Map;
//   view!: MapView;

//   constructor() { }

//   ngOnInit(): void {
//     this.map = new Map({
//       basemap: 'hybrid'
//     });

//     const featureLayer = new FeatureLayer({
//       url: '//services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0'
//     });

//     this.map.add(featureLayer);

//     this.view = new MapView({
//       container: this.mapViewEl.nativeElement,
//       map: this.map,
//       zoom: 10,
//       center: [-118.805, 34.027] // Long, Lat
//     });
//   }
// }