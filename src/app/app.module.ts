import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { EsriMapComponent } from "./pages/esri-map/esri-map.component";
import { AppRoutingModule } from "./app-routing.module";

import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { FirebaseService } from './services/database/firebase';
import { FirebaseMockService } from './services/database/firebase-mock';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from '@angular/material/icon'

import { FlexLayoutModule } from '@angular/flex-layout';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from "./pages/register-page/register-page.component";
import { ButtonComponent } from './button/button.component';
import { CallingFunctionsService } from "./services/comunication/calling-functions.service";
import { AddClubComponent } from "./pages/add-club/add-club.component";


@NgModule({
  declarations: [AppComponent, EsriMapComponent, NavbarComponent, LoginPageComponent, RegisterPageComponent, ButtonComponent, AddClubComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    MatIconModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebase, 'AngularDemoArcGIS'),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [
    FirebaseService,
    FirebaseMockService,
    CallingFunctionsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
