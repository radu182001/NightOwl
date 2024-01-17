import { Component, OnInit } from '@angular/core';
import { CallingFunctionsService } from 'src/app/services/comunication/calling-functions.service';
import { FirebaseService } from 'src/app/services/database/firebase';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  email: string;
  password: string;
  repeatPassword: string;

  constructor(private fbs: FirebaseService, private call: CallingFunctionsService, public dialogRef: MatDialogRef<RegisterPageComponent>) { }

  ngOnInit(): void {
  }

  getEmail(event: any) {
    this.email = event.target.value;
  }

  getPassword(event: any) {
    this.password = event.target.value;
  }

  getRepeatPassword(event: any) {
    this.repeatPassword = event.target.value;
  }

  register() {
    if (this.password === this.repeatPassword) {
      this.fbs.register(this.email, this.password)
        .then((result) => {
          // Handle successful registration
          // For example, navigate to the dashboard or home page
          // this.router.navigate(['/dashboard']);
          this.call.userState();
          this.dialogRef.close();
        });
  } else {
    alert("Passwords do not match");
  }
}

}
