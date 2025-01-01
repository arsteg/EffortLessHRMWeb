import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-confirm-cancel',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    FormsModule
  ],
  templateUrl: './confirm-cancel.component.html',
  styleUrl: './confirm-cancel.component.css'
})
export class ConfirmCancelComponent {
  cancelAtCycleEnd = 1;
  constructor(
    public dialogRef: MatDialogRef<ConfirmCancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cancelSubscription(){
    this.dialogRef.close(this.cancelAtCycleEnd);
  }
}
