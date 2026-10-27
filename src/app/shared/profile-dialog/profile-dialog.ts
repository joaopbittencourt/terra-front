import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ProfileDialogData {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.css'
})
export class ProfileDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProfileDialogData,
    private dialogRef: MatDialogRef<ProfileDialogComponent>
  ) {}

  logout(): void {
    this.dialogRef.close('logout');
  }
}