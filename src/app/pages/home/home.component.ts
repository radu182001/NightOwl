import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { CallingFunctionsService } from "src/app/services/comunication/calling-functions.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    constructor(private router: Router, private call: CallingFunctionsService) {}

  getStarted() {
    this.call.userState();
    this.router.navigateByUrl('map');
  }
}