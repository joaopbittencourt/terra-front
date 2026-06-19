import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { healthInsurance } from '../../../shared/data/health-plan.interface';
import { HealthPlanService } from '../../../shared/services/health-plan.service';
import { NotificationService } from '../../../services/notification/notification';

@Component({
  selector: 'app-health-plan-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './health-plan-form-dialog.html',
  styleUrl: './health-plan-form-dialog.css'
})
export class HealthPlanFormDialog {
  private notification = inject(NotificationService);
  form: FormGroup;
  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private healthPlanService: HealthPlanService,
    private dialogRef: MatDialogRef<HealthPlanFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { plan: healthInsurance | null }
  ) {
    this.isEdit = !!data.plan;
    this.form = this.fb.group({
      name: [data.plan?.name || '', Validators.required],
      effetiveDate: [data.plan?.effetiveDate || '', Validators.required],
      dateOfValidity: [data.plan?.dateOfValidity || '', Validators.required],
      status: [data.plan?.status ?? true, Validators.required],
      registrationNumber: [data.plan?.registrationNumber || '', Validators.required],
      operatorCod: [data.plan?.operatorCod || '', Validators.required],
      productCod: [data.plan?.productCod || '', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      const plan: healthInsurance = {
        id: this.data.plan?.id || '',
        ...this.form.value
      };
      //const operation = this.isEdit ? this.healthPlanService.update(plan) : this.healthPlanService.add(plan);
      const operation = this.healthPlanService.add(plan);
      operation.subscribe({
        next: (savedPlan) => {
          this.notification.showSuccess('Plano salvo com sucesso');
          this.dialogRef.close(savedPlan);
        },
        error: (err) => {
          this.notification.showError('Erro ao salvar plano: ' + (err?.message || err));
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}