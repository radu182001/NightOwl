import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from 'src/app/services/database/firebase';

@Component({
  selector: 'app-add-club',
  templateUrl: './add-club.component.html',
  styleUrls: ['./add-club.component.scss']
})
export class AddClubComponent{

  name: string;
  addr: string;
  img: string;
  desc: string;

  constructor(
    public dialogRef: MatDialogRef<AddClubComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fbs: FirebaseService
  ) {}

  addClub() {
    this.dialogRef.close();
    this.fbs.addClub(this.data.point.latitude, this.data.point.longitude, this.name, this.addr, this.img, this.desc);
  }

  getName(event: any) {
    this.name = event.target.value;
  }

  getAddress(event: any) {
    this.addr = event.target.value;
  }

  getImage(event: any) {
    this.img = event.target.value;
  }

  getDesc(event: any) {
    this.desc = event.target.value;
  }

}
