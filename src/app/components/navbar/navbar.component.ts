import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// import { LoginPageComponent } from '../../pages/login-page/login-page.component';
// import { RegisterPageComponent } from '../../pages/register-page/register-page.component';
import { LoginPageComponent } from 'src/app/pages/login-page/login-page.component';
import { RegisterPageComponent } from 'src/app/pages/register-page/register-page.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(private dialog: MatDialog) {}

  openLogin() {
    this.dialog.open(LoginPageComponent, {panelClass: 'custom-popup', backdropClass: 'backdropBackground'});
  }

  openRegister() {
    this.dialog.open(RegisterPageComponent, {panelClass: 'custom-popup', backdropClass: 'backdropBackground'});
  }

}
