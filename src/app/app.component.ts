import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Event, Router } from '@angular/router';
import { Subscription } from "rxjs";

import { MatDialog } from '@angular/material/dialog';

import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { EsriMapComponent } from './pages/esri-map/esri-map.component';
import { CallingFunctionsService } from './services/comunication/calling-functions.service';
import { FirebaseService } from './services/database/firebase';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{

  logged: boolean;
  currentUser: firebase.User | null;
  user = null;

  favFilter = false;

  private subscription: Subscription;

  constructor(private dialog: MatDialog, private call: CallingFunctionsService, private fbs: FirebaseService) {

    this.subscription = this.call.triggerUserState$.subscribe(() => {
      this.getUserState();
    });

  }
  
  openLogin() {
    this.dialog.open(LoginPageComponent, {panelClass: 'custom-popup', backdropClass: 'backdropBackground'});
  }

  openRegister() {
    this.dialog.open(RegisterPageComponent, {panelClass: 'custom-popup', backdropClass: 'backdropBackground'});
  }

  addClub() {
    this.call.addClub();
  }

  getFav() {
    this.favFilter = true;
    this.call.setFilterState(this.favFilter);
    this.call.getFav();
  }

  clearFilters() {
    this.favFilter = false;
    this.call.setFilterState(this.favFilter);
    this.call.renderAllClubs();
  }

  logout() {
    this.fbs.logout();
    location.reload();
  }

  getUserState() {
    this.fbs.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.logged = true;
      } else {
        this.logged = false;
      }
    });
  }

  ngOnInit() {
    this.fbs.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.user = this.currentUser.email.split('@')[0];
        this.logged = true;
        console.log(user.email);
      } else {
        this.logged = false;
      }
    });
  }

}