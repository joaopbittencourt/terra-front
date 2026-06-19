import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ServicePackage } from '../../../shared/data/service-package.interface';
import { Therapy } from '../../../shared/data/therapy.interface';
import { TherapyService } from '../../../shared/services/therapy.service';
import { NotificationService } from '../../../services/notification/notification';

@Component({
  selector: 'app-service-package-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './service-package-form-dialog.html',
  styleUrl: './service-package-form-dialog.css'
})
export class ServicePackageFormDialogComponent implements OnInit {
  form: FormGroup;
  therapies: Therapy[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ServicePackageFormDialogComponent>,
    private therapyService: TherapyService,
    @Inject(MAT_DIALOG_DATA) public data: ServicePackage | null
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      therapy: [null, [Validators.required]],
      qtdSessions: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      active: [true]
    });
  }

  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.loadTherapies();
    if (this.data) {
      this.form.patchValue({
        id: this.data.id,
        name: this.data.name,
        therapy: this.data.therapy,
        qtdSessions: this.data.qtdSessions,
        price: this.data.price,
        description: this.data.description,
        active: this.data.active
      });
    }
  }

  loadTherapies(): void {
    this.therapyService.getAll().subscribe({
      next: (therapies: Therapy[]) => { this.therapies = therapies; },
      error: (err) => { console.error('Error loading therapies for service package form', err); this.notification.showError('Erro ao carregar terapias: ' + (err?.message || err)); }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  // Função de comparação essencial para objetos
  compareTherapies(o1: Therapy, o2: Therapy): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}
