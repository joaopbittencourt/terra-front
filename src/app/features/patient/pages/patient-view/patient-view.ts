import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';

import { PatientService } from '../../../../shared/services/patient.service';
import { TherapyService } from '../../../../shared/services/therapy.service';
import { TherapistService } from '../../../../shared/services/therapist.service';
import { ContractService } from '../../../../shared/services/contract.service';
import { SessionIdEnum } from '../../../../shared/data/session-id.enum';
import { GuardiansService } from '../../../../shared/services/guardians.service';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Schedule } from '../../../../shared/data/schedule.interface';
import { Therapist } from '../../../../shared/data/therapist.interface';
import { Therapy } from '../../../../shared/data/therapy.interface';
import {MatGridListModule} from '@angular/material/grid-list';
import { Session } from '../../../../shared/data/session.interface';
import { Patient } from '../../../../shared/data/patient.interface';
import { MatExpansionModule } from '@angular/material/expansion';
import { Contract } from '../../../../shared/data/contract.interface';
import { Guardian } from '../../../../shared/data/guardian.interface';
import { healthInsurance } from '../../../../shared/data/health-plan.interface';
import { MatCardModule } from "@angular/material/card";
import { PatientModel } from '../../../../shared/data/patient.model';
import { SessionService } from '../../../../shared/services/session.service';
import { SessionDTO } from '../../../../shared/data/session-dto.interface';
import { C } from '@angular/cdk/keycodes';
import { CpfPipe } from "../../../../shared/pipes/cpf-pipe";
import { PhoneNumberPipe } from '../../../../shared/pipes/phone-number-pipe';
import { NotificationService } from '../../../../services/notification/notification';

@Component({
  selector: 'app-patient-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatGridListModule,
    MatExpansionModule,
    // new
    MatCheckboxModule,
    MatDividerModule,
    MatCardModule,
    CpfPipe,
    PhoneNumberPipe
    
 
],
  templateUrl: './patient-view.html',
    
  styleUrls: ['./patient-view.css']
})
export class PatientViewComponent implements OnInit {
  private notification = inject(NotificationService);

  therapies: any[] = [];
  therapists: any[] = [];

  sending = false;
  patientId: string = "";
  contractId: string | null = null;
  patientSessions: SessionDTO[] = [];
  patient: Patient | null = null;
  contract: Contract = new Object() as Contract;
  guardianList: Guardian[] = [];
  healthInsurance: healthInsurance | null = null;
  therapyList: Therapy[] = [];
  therapistList: Therapist[] = [];

  loadingSessions = false;
  private scheduleSub?: Subscription;
  private patientSub?: Subscription;
  private sessionSub?: Subscription;
  healthInsurances: any[] = [];
  loadinghealthInsurances = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private guardiansService: GuardiansService,
    private therapyService: TherapyService,
    private therapistService: TherapistService,
    private contractService: ContractService,
    private scheduleService: ScheduleService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {
   
    
  }

  ngOnInit(): void {
    // try to load sessions for this patient/contract
    this.patientId = this.activeRoute.snapshot.paramMap.get('id')!;
    this.loadPatientSessions();
  }

  private loadPatientSessions(): void {
    console.log('Loading patient sessions for patientId:', this.patientId);
    // If we don't have a contractId but have patientId, try to retrieve contract
    if (this.patientId) {
      this.loadingSessions = true;
      this.patientSub?.unsubscribe();
      this.patientSub = this.patientService.getById(this.patientId).subscribe({
        next: (data: any) => {
          this.loadingSessions = false;
          this.patient = data || new Object();
          this.guardianList = data.guardians || [];
          this.contract = data.contract || null;

          this.healthInsurance = data.healthInsurance || null;
          this.loadContractActive(this.patientId);
        },
        error: (err) => {
            console.error('Error loading contracts for patient', err);
            this.loadingSessions = false;
            this.patientSessions = [];
            this.notification.showError('Erro ao carregar dados do paciente: ' + (err?.message || err));
        }
      });
    }
  }
  private loadContractActive(patientId: string): void {
    this.loadingSessions = true;
    this.contractService.getByPatient(patientId).subscribe({
      next: (data: any) => {
        this.loadingSessions = false;
        if (data.length > 0) {
          const c: Contract = data[0];
          this.contract = c;

          this.healthInsurance = this.contract.healthInsurance || null;

          this.fetchSessionsByContract(c.id.toString());
        } else {
          this.patientSessions = [];
        }
      },
      error: (err) => {
        console.error('Error loading contracts for patient', err);
        this.loadingSessions = false;
        this.patientSessions = [];
        this.notification.showError('Erro ao carregar contrato do paciente: ' + (err?.message || err));
      }
    }); 
  }

  private fetchSessionsByContract(contractId: string): void {
    this.loadingSessions = true;
    console.log('Fetching schedules for contractId:', contractId);
    this.sessionSub?.unsubscribe();
    this.sessionSub = this.sessionService.getAllByContract(contractId).subscribe({
      next: (sessionList: SessionDTO[]) => {
        this.therapyList = sessionList.filter((t: SessionDTO, index, arr) => arr.findIndex((item: SessionDTO) => item.therapy.id === t.therapy.id) === index).map((s: SessionDTO) => s.therapy);
        this.therapistList = sessionList.filter((t: SessionDTO, index, arr) => arr.findIndex((item: SessionDTO) => item.therapist.id === t.therapist.id) === index).map((s: SessionDTO) => s.therapist) || [];
        sessionList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.patientSessions = sessionList;
        this.loadingSessions = false;
      },
      error: (err: any) => {
        console.error('Error loading schedules', err);
        this.loadingSessions = false;
        this.patientSessions = [];
        this.notification.showError('Erro ao carregar agendamentos: ' + (err?.message || err));
      }
    });
  }

  ngOnDestroy(): void {
    this.scheduleSub?.unsubscribe();
    this.patientSub?.unsubscribe();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  cancel() {
    this.router.navigate(['/patient']);
  }
}
