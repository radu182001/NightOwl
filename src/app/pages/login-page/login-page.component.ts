import { Component, OnInit } from '@angular/core';
import { CallingFunctionsService } from 'src/app/services/comunication/calling-functions.service';
import { FirebaseService } from 'src/app/services/database/firebase';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  email: string;
  password: string;

  constructor(private fbs: FirebaseService, private call: CallingFunctionsService, public dialogRef: MatDialogRef<LoginPageComponent>) { }

  ngOnInit(): void {
  }

  getEmail(event: any) {
    this.email = event.target.value;
  }

  getPassword(event: any) {
    this.password = event.target.value;
  }

  login() {
    this.fbs.login(this.email, this.password).then((result) => {
      this.call.userState();
      this.dialogRef.close();
    });
    
  }

}
