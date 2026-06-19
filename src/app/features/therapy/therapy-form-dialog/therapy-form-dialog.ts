import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { Therapy } from '../../../shared/data/therapy.interface';
import { Modality } from '../../../shared/data/modality.interface';
import { ModalityService } from '../../../shared/services/modality.service';
import { Price } from '../../../shared/data/price.model';

@Component({
  selector: 'app-therapy-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './therapy-form-dialog.html',
  styleUrl: './therapy-form-dialog.css'
})
export class TherapyFormDialogComponent implements OnInit {
  form: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TherapyFormDialogComponent>,
    private modalityService: ModalityService,
    @Inject(MAT_DIALOG_DATA) public data: Therapy | null
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      description: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      
      this.form.patchValue({
        id: this.data.id,
        name: this.data.name,
        description: this.data.description,
        active: this.data.active
      });
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