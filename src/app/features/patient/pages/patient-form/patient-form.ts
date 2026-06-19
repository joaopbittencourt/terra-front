import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, Router, ActivatedRoute} from '@angular/router';

import { Patient } from '../../../../shared/data/patient.interface';
import { PatientModel } from '../../../../shared/data/patient.model';
import { PatientService } from '../../../../shared/services/patient.service';
import { Therapy } from '../../../../shared/data/terapia.interface';
import { TherapyService } from '../../../../shared/services/therapy.service';
import { HealthPlanService } from '../../../../shared/services/health-plan.service';
import { healthInsurance } from '../../../../shared/data/health-plan.interface';
import { ServicePackageService } from '../../../../shared/services/service-package.service';
import { ServicePackage } from '../../../../shared/data/service-package.interface';
import { NotificationService } from '../../../../services/notification/notification';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css'
})
export class PatientFormComponent implements OnInit {
  private notification = inject(NotificationService);
  form: FormGroup;
  patientId: string | null = null;
  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'not_informed', label: 'Not Informed' }
  ];

  therapies: Therapy[] = [];
  healthPlans: healthInsurance[] = [];
  servicePackages: ServicePackage[] = [];
  servicePackage: ServicePackage | null = null;

  private createGuardianFormGroup() {
    return this.fb.group({
      name: ['', [Validators.required]],
      relationship: [''],
      phoneNumber: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
  }

  addGuardian() {
    const guardians = this.form.get('guardians') as FormArray;
    guardians.push(this.createGuardianFormGroup());
  }

  removeGuardian(index: number) {
    const guardians = this.form.get('guardians') as FormArray;
    guardians.removeAt(index);
  }

  getGuardians() {
    return (this.form.get('guardians') as FormArray).controls;
  }

  constructor(
    private fb: FormBuilder, 
    private patientService: PatientService,
    private therapyService: TherapyService,
    private healthPlanService: HealthPlanService,
    private servicePackageService: ServicePackageService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      birthDate: [null, [Validators.required]],
      phoneNumber: [''],
      gender: ['not_informed'],
      document: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      rg: [''],
      active: [true],
      address: this.fb.group({
        street: [''],
        number: [''],
        complement: [''],
        neighborhood: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: ['Brazil']
      }),
      guardians: this.fb.array([]),
      planCode: [''],
      recordNumber: [''],
      heightCm: [null],
      weightKg: [null],
      allergies: [''],
      medicalHistory: [''],
      observations: ['']
    });
  }

  ngOnInit(): void {
    // Pegar o ID do paciente da URL
    this.activatedRoute.paramMap.subscribe(params => {
      this.patientId = params.get('id');
      this.loadPatientData();
    });

    // Carregar dados se for edição
    this.getTherapies();
    this.getHealthPlans();
    this.getPackages();
  }
  loadPatientData() {
    this.patientService.getById(this.patientId!).subscribe({
      next: (patient) => {
        if (patient) {    
          this.form.patchValue({
            ...patient,
            birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
            allergies: patient.allergies ? patient.allergies.join(', ') : '',
            medicalHistory: patient.medicalHistory ? patient.medicalHistory.join(', ') : ''
          }); 
          if (patient.guardians) {
            const guardiansFormArray = this.form.get('guardians') as FormArray;
            patient.guardians.forEach(guardian => {
              guardiansFormArray.push(this.fb.group({
                name: [guardian.name, [Validators.required]],
                relationship: [guardian.relationship],
                phoneNumber: [guardian.phoneNumber, [Validators.required]],
                cpf: [guardian.cpf, [Validators.required, Validators.pattern(/^\d{11}$/)]]
              }));
            });
          }
        }
      },
      error: (err) => {
        console.error('Error loading patient data:', err);
        this.notification.showError('Erro ao carregar dados do paciente: ' + (err?.message || err));
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const patient = new PatientModel({
        ...formValue,
        allergies: formValue.allergies ? formValue.allergies.split(',').map((a: string) => a.trim()) : [],
        medicalHistory: formValue.medicalHistory ? formValue.medicalHistory.split(',').map((h: string) => h.trim()) : []
      });

      // Save the patient
      this.patientService.create(patient).subscribe({
        next: (data:any) => {
          this.notification.showSuccess('Paciente salvo com sucesso');
        }, 
        error: (err: any) =>{
          this.notification.showError('Erro ao salvar paciente: ' + (err?.message || err));
        },
        complete: () => {
          this.router.navigate(['/patient'])
        }
      })
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getTherapies() {
    this.therapyService.getAll().subscribe({
      next: (data: Therapy[]) => {
        this.therapies = data;
      },
      error: (err) => {
        console.error('Error fetching therapies:', err);
        this.notification.showError('Erro ao buscar terapias: ' + (err?.message || err));
      }
    });
  }

  private getHealthPlans() {
    this.healthPlanService.getAll().subscribe({
      next: (data: healthInsurance[]) => {
        this.healthPlans = data;
      },
      error: (err) => {
        console.error('Error fetching health plans:', err);
        this.notification.showError('Erro ao buscar planos de saúde: ' + (err?.message || err));
      }
    });
  }

  private getPackages() {
    this.servicePackageService.getAll().subscribe({ 
      next: (data: ServicePackage[]) => {
        this.servicePackages = data;
      },
      error: (err) => {
        console.error('Error fetching service packages:', err);
        this.notification.showError('Erro ao buscar pacotes de serviço: ' + (err?.message || err));
      }
    });
  }   


  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Required field';
    }
    if (control.hasError('email')) {
      return 'Invalid email';
    }
    if (control.hasError('pattern')) {
      return 'Invalid format';
    }
    return '';
  }
}