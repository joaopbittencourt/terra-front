import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { Modality } from '../../../shared/data/modality.interface';
import { NotificationService } from '../../../services/notification/notification';

@Component({
  selector: 'app-modality-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './modality-form-dialog.html',
  styleUrl: './modality-form-dialog.css'
})
export class ModalityFormDialogComponent implements OnInit {
  private notification = inject(NotificationService);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalityFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Modality | null
  ) {
    this.form = this.fb.group({
      id: [null],
      modality: ['', [Validators.required]],
      description: [''],
      status: [true]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}