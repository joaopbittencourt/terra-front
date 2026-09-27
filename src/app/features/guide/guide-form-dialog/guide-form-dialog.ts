import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Guide } from '../../../shared/data/guide.interface';
import { PatientModel } from '../../../shared/data/patient.model';
import { healthInsurance } from '../../../shared/data/health-plan.interface';
import { PatientService } from '../../../shared/services/patient.service';
import { HealthPlanService } from '../../../shared/services/health-plan.service';

const sessionsWithinLimit: ValidatorFn = (form): ValidationErrors | null => {
  const total = Number(form.get('totalSessionsAuthorized')?.value);
  const used = Number(form.get('usedSessions')?.value);
  return used > total ? { usedSessionsExceedTotal: true } : null;
};

@Component({
  selector: 'app-guide-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './guide-form-dialog.html',
  styleUrl: './guide-form-dialog.css'
})
export class GuideFormDialogComponent implements OnInit {
  readonly form: FormGroup;
  patients: PatientModel[] = [];
  healthPlans: healthInsurance[] = [];
  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Ativa' },
    { value: 'INACTIVE', label: 'Inativa' }
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<GuideFormDialogComponent>,
    private readonly patientService: PatientService,
    private readonly healthPlanService: HealthPlanService,
    @Inject(MAT_DIALOG_DATA) public readonly guide: Guide | null
  ) {
    this.form = this.formBuilder.group({
      patientId: [guide?.patientId ?? '', Validators.required],
      healthPlanId: [guide?.healthPlanId ?? '', Validators.required],
      guideNumber: [guide?.guideNumber ?? '', Validators.required],
      authorizationCode: [guide?.authorizationCode ?? '', Validators.required],
      expirationDate: [guide?.expirationDate ?? '', Validators.required],
      totalSessionsAuthorized: [guide?.totalSessionsAuthorized ?? 1, [Validators.required, Validators.min(1)]],
      usedSessions: [guide?.usedSessions ?? 0, [Validators.required, Validators.min(0)]],
      status: [guide?.status ?? 'ACTIVE', Validators.required]
    }, { validators: sessionsWithinLimit });
  }

  ngOnInit(): void {
    this.patientService.refreshPatients();
    this.patientService.getAll().subscribe(patients => this.patients = patients);
    this.healthPlanService.getAll().subscribe({
      next: plans => this.healthPlans = plans ?? [],
      error: () => this.healthPlans = []
    });
  }

  get selectedHealthPlan(): healthInsurance | undefined {
    return this.healthPlans.find(plan => plan.id === this.form.get('healthPlanId')?.value);
  }

  patientName(patient: PatientModel): string {
    return [patient.firstName, patient.lastName].filter(Boolean).join(' ');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      id: this.guide?.id ?? '',
      ...this.form.getRawValue()
    } as Guide);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}