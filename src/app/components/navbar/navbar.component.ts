import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { LoginPageComponent } from '../../pages/login-page/login-page.component';
import { RegisterPageComponent } from '../../pages/register-page/register-page.component';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
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
