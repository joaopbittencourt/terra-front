import { Component, inject, OnInit } from '@angular/core';
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
import { HealthPlanService } from '../../../../shared/services/health-plan.service';
import { firstValueFrom } from 'rxjs';
import { Therapist } from '../../../../shared/data/therapist.interface';
import { ModalityService } from '../../../../shared/services/modality.service';
import { NotificationService } from '../../../../services/notification/notification';
import { Contract } from '../../../../shared/data/contract.interface';
import { Patient } from '../../../../shared/data/patient.interface';
import { Schedule } from '../../../../shared/data/schedule.interface';
import { ScheduleDTO } from '../../../../shared/data/schedule-dto.interface';
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-patient-stepper',
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
    // new
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './patient-stepper.html',
  styleUrl: './patient-stepper.css'
})
export class PatientStepperComponent implements OnInit {
  private notification = inject(NotificationService);
  basicInfo: FormGroup;
  agreementInfo: FormGroup = new FormGroup({});
  placeholder1: FormGroup;
  placeholder2: FormGroup;
  therapyInfo: FormGroup;

  contract:Contract | null = null;
  patient:Patient | null = null;
  schedules: any[] = [];

  therapies: any[] = [];
  therapists: any[] = [];

  sending = false;
  patientId: string | null = null;
  contractId: string | null = null;
  healthPlans: any[] = [];
  modalityList: any[] = [];
  loadingHealthPlans = false;
  loadingModalitiyList = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private guardiansService: GuardiansService,
    private healthPlanService: HealthPlanService,
    private therapyService: TherapyService,
    private therapistService: TherapistService,
    private contractService: ContractService,
    private modalistyService: ModalityService,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.basicInfo = this.fb.group({
      firstName: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      guardians: this.fb.array([ this.createGuardianGroup() ]),
      cep: ['', [Validators.pattern(/^\d{5}-\d{3}$/)]] // Brazilian CEP format
    });
    // trim assignments when multiple therapies become disallowed
    this.agreementInfo.valueChanges.subscribe(() => {
      if (!this.allowMultipleTherapies() && this.assignments.length > 1) {
        // keep the first assignment only
        while (this.assignments.length > 1) this.assignments.removeAt(this.assignments.length - 1);
      }
    });

    this.agreementInfo = this.fb.group({
      hasHealthPlan: [true],
      healthPlanId: [''],
      modalityId: ['']
    });

    this.placeholder1 = this.fb.group({});
    this.placeholder2 = this.fb.group({});

    this.therapyInfo = this.fb.group({
      assignments: this.fb.array([])
    });
  }

  private createGuardianGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      cpf: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phoneNumber: [''],
      exists: [false],
      loading: [false]
    });
  }

  get guardians(): FormArray {
    return this.basicInfo.get('guardians') as FormArray;
  }

  addGuardian() {
    if (this.guardians.length >= 2) return;
    this.guardians.push(this.createGuardianGroup());
  }

  removeGuardian(index: number) {
    if (this.guardians.length <= 1) return;
    this.guardians.removeAt(index);
  }

  ngOnInit(): void {

    this.patientId = this.activatedRoute.snapshot.paramMap.get('patientId');

    this.loadHealthPlans();
    this.loadTherapiesAndTherapists();
    this.loadModalitiyList();

    if(!!this.patientId)
      this.loadInfoPatient(); 
    
    
    // adjust validators when switching between health plan / particular
    this.agreementInfo.get('hasHealthPlan')?.valueChanges.subscribe((hasPlan: boolean) => {
      const hpControl = this.agreementInfo.get('healthPlanId');
      const modControl = this.agreementInfo.get('modality');
      if (hasPlan) {
        hpControl?.setValidators([Validators.required]);
        modControl?.clearValidators();
        modControl?.setValue('');
      } else {
        modControl?.setValidators([Validators.required]);
        hpControl?.clearValidators();
        hpControl?.setValue('');
      }
      hpControl?.updateValueAndValidity();
      modControl?.updateValueAndValidity();
    });
    // ensure at least one assignment block
    if (this.assignments.length === 0) {
      this.addAssignment();
    }
  }
  loadInfoPatient() {

    this.contractService.getByPatient(this.patientId || '').subscribe({
      next: (data:Contract[]) => {

        //this.contract = data.filter((c: Contract) => c.status === true)[0];
        this.contract = data[0];
        if(!this.contract) {
          this.notification.showError('Nenhum contrato ativo encontrado para este paciente.');
          //return;
        }
        this.contractId = this.contract.id.toString();
        this.patient =  this.contract.patient || this.patient;
        if (this.patient) {
          this.basicInfo.patchValue({
            firstName: this.patient.firstName || '',
            cpf: this.patient.document ? this.formatCpf(this.patient.document) : '',
            phoneNumber: this.patient.phoneNumber ? this.formatTelephone(this.patient.phoneNumber) : '',
            email: this.patient.email || ''
          });
          this.basicInfo.get('cpf')?.touched; // trigger validation
          if (this.patient.guardians && this.patient.guardians.length > 0) {
            this.guardians.clear();
            this.patient.guardians.forEach((g: any) => {
              const group = this.createGuardianGroup();
              group.patchValue({
                id: g.id || g._id || '',
                cpf: g.cpf ? this.formatCpf(g.cpf.toString()) : '',
                name: g.name || '',
                phoneNumber: g.phoneNumber ? this.formatTelephone(g.phoneNumber) : '',
                exists: true
              });
              group.get('name')?.disable({ emitEvent: false });
              group.get('name')?.clearValidators();
              this.guardians.push(group);   
            });
          }
        }
          this.agreementInfo.patchValue({
            hasHealthPlan: !!this.contract.healthInsurance,
            healthPlanId: this.contract.healthInsurance?.id || '',
            modalityId: this.contract.modality?.id || '',
            therapists: this.therapists
          });
        
      },
      error: (err) => {
        console.error('Error loading contract info', err);
        this.notification.showError('Erro ao carregar informações de contrato: ' + (err?.message || err));
         this.loadPatient();
      },
      complete: () => { 

        if (this.contractId) {    
          this.loadSchedules(this.contractId);
        }else{
         
        }
      }
    });
  }
  loadPatient() {
    this.patientService.getById(this.patientId || '').subscribe({
      next: (data: Patient) => {
        this.patient = data;  
          if (this.patient) {
          this.basicInfo.patchValue({
            firstName: this.patient.firstName || '',
            cpf: this.patient.document ? this.formatCpf(this.patient.document) : '',
            phoneNumber: this.patient.phoneNumber ? this.formatTelephone(this.patient.phoneNumber) : '',
            email: this.patient.email || ''
          });
          this.basicInfo.get('cpf')?.touched; // trigger validation
          if (this.patient.guardians && this.patient.guardians.length > 0) {
            this.guardians.clear();
            this.patient.guardians.forEach((g: any) => {
              const group = this.createGuardianGroup();
              group.patchValue({
                id: g.id || g._id || '',
                cpf: g.cpf ? this.formatCpf(g.cpf.toString()) : '',
                name: g.name || '',
                phoneNumber: g.phoneNumber ? this.formatTelephone(g.phoneNumber) : '',
                exists: true
              });
              group.get('name')?.disable({ emitEvent: false });
              group.get('name')?.clearValidators();
              this.guardians.push(group);   
            });
          }
        }
      },    
      error: (err) => {
        console.error('Error loading patient info', err);
        this.notification.showError('Erro ao carregar informações do paciente: ' + (err?.message || err));
      }
    });
  }
  loadSchedules(contractId: string) {  
   
    this.scheduleService.getAllByContractPeerTherapist(contractId).subscribe({        
      next: (data:ScheduleDTO[]) => { 
        console.log('Schedules loaded', data);
        this.schedules = data || []; 
        this.schedules.forEach((s: ScheduleDTO) => {
          console.log('Mapping schedule to form', s);
          let index = -1;
            this.assignments?.getRawValue().forEach((a: any, i: number) => {
              if (a.therapyId === s.therapyId && a.therapistId === s.therapistId) {
                index = i;
              }
            });

            if(index !== -1) {

              const assign = this.assignments.at(index) as FormGroup;
              let sessions = assign.get('sessions') as FormArray;
              
              
              this.assignments.at(index).patchValue({ 
                sessions: [...sessions.value, ...s.sessionIdEnumList] });
              
            }else{
              this.assignments.push(this.fb.group({
                therapyId: [s.therapyId, [Validators.required]],
                therapistId: [s.therapistId, [Validators.required]],
                sessions: [s.sessionIdEnumList]
              }));
            }
          
        });
  
      },
      error: (err) => {
        console.error('Error loading schedules', err);
        this.notification.showError('Erro ao carregar agendamentos: ' + (err?.message || err));
      }
    });
  }
  LoadInfo() {
    throw new Error('Method not implemented.');
  }

  private loadTherapiesAndTherapists() {
    this.therapyService.getAll().subscribe((data: any) => { this.therapies = data || []; });
    this.therapistService.getAll().subscribe((data: any) => { this.therapists = data || []; });
  }

  private createAssignmentGroup(): FormGroup {
    return this.fb.group({
      therapyId: ['', [Validators.required]],
      therapistId: ['', [Validators.required]],
      sessions: this.fb.array([])
    });
  }

  get assignments(): FormArray {
    return this.therapyInfo.get('assignments') as FormArray;
  }
//t.therapies && t.therapies.map(ther => ther.id).indexOf(assignments.at(i).get('therapyId')?.value) === -1"
  getDisableTherapyOption(therapist: Therapist, assignIdx: number): boolean {
    return therapist.therapies?.map((ther:any) => ther.id).indexOf(assignIdx) === -1
  } 

  addAssignment(formGroup?: FormGroup) {
    const idx = this.assignments.length;
    this.assignments.push(formGroup? formGroup : this.createAssignmentGroup());
    // subscribe to changes to clear dependent fields
    const group = this.assignments.at(idx) as FormGroup;
    group.get('therapyId')?.valueChanges.subscribe(() => {
      group.get('therapistId')?.setValue('');
      (group.get('sessions') as FormArray).clear();
    });
    group.get('therapistId')?.valueChanges.subscribe(() => {
      (group.get('sessions') as FormArray).clear();
    });
  }

  removeAssignment(index: number) {
    this.assignments.removeAt(index);
  }

  toggleSession(assignIdx: number, sessionId: string) {
    if (!this.therapistAllowsSession(assignIdx, sessionId)) return;
    const assign = this.assignments.at(assignIdx) as FormGroup;
    const sessions = assign.get('sessions') as FormArray;
    const found = sessions.value.indexOf(sessionId);
    if (found === -1) {
      console.log(sessions)
      if(sessions.length > 0){
        sessions.push(this.fb.control(sessionId));
      }else{
        let sess= new FormArray([this.fb.control(sessionId)]);
        assign.setControl('sessions',sess);
      }
        
    } else {
      sessions.removeAt(found);
    }
  }

  isSessionSelected(assignIdx: number, sessionId: string): boolean {
    const assign = this.assignments.at(assignIdx) as FormGroup;
    const sessions = assign.get('sessions') as FormArray;
    return sessions.value.some((s: string) => s === sessionId);
  }

  therapistAllowsSession(assignIdx: number, sessionId: string): boolean {
    const assign = this.assignments.at(assignIdx) as FormGroup;
    const therapistId = assign.get('therapistId')?.value;
    if (!therapistId) return false;
    const th = this.therapists.find(t => t.id === therapistId);
    if (!th) return false;
    const sessions = th.sessions || th.sessionsId || [];
    return sessions.indexOf(sessionId) !== -1;
  }

  async saveTherapyInfo(step: any) {
    if (this.therapyInfo.invalid) {
      this.markFormGroupTouched(this.therapyInfo);
      return; 
    }

    if (!this.patientId) {
      this.snackBar.open('Patient not created yet. Complete basic info first.', 'Fechar', { duration: 3000 });
      return;
    }

    if (!this.contractId) {
      this.snackBar.open('Contract not created yet. Complete agreement info first.', 'Fechar', { duration: 3000 });
      return;
    }
    const payload: any =  this.assignments.value.map((a: any) => ({
        therapy: a.therapyId,
        therapist: a.therapistId,
        sessionList: a.sessions.join(";")
      }));
      
    this.sending = true;
    try {
      await firstValueFrom(this.scheduleService.setRegisterAppointment(this.contractId, payload));
      step.next();
    } catch (err: any) {
      console.error('Error saving therapy info', err);
      const msg = err?.error?.message || err?.message || 'Erro ao salvar';
      this.notification.showError('Erro ao salvar informações de terapia: ' + msg);
    } finally {
      this.sending = false;
    }
      
  }

  getSessionList(): string[] {
    return Object.keys(SessionIdEnum).filter(k => isNaN(Number(k)));
  }

  allowMultipleTherapies(): boolean {
    const hasPlan = this.agreementInfo.get('hasHealthPlan')?.value;
    const modalityId = this.agreementInfo.get('modalityId')?.value;
    return !!hasPlan || modalityId === 'Multidisciplinar';
  }

  private loadHealthPlans() {
    this.loadingHealthPlans = true;
    this.healthPlanService.getAll().subscribe({
      next: (data: any) => { this.healthPlans = data || []; this.loadingHealthPlans = false; },
      error: (err) => { console.error('Error loading health plans', err); this.loadingHealthPlans = false; this.notification.showError('Erro ao carregar planos de saúde: ' + (err?.message || err)); }
    });
  }

  private loadModalitiyList() {
    this.loadingModalitiyList = true;
    this.modalistyService.getAll().subscribe({
      next: (data: any) => { this.modalityList = data || []; this.loadingModalitiyList = false; },
      error: (err) => { console.error('Error loading modalities', err); this.loadingModalitiyList = false; this.notification.showError('Erro ao carregar modalidades: ' + (err?.message || err)); }
    });   
  }

  formatCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const onlyDigits = input.value.replace(/\D/g, '').slice(0,11);
    const formatted = this.formatCpf(onlyDigits);
    this.basicInfo.get('cpf')?.setValue(formatted, { emitEvent: false });
  }
  
  formatCpf(cpf: string): string {

    let formatted = cpf.length == 10? 0+cpf :  cpf;

    if (cpf.length > 9) {
      formatted = formatted.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      formatted = formatted.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      formatted = formatted.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }

    return formatted;
  }

  formatCpfInputGuardian(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if(input.value.length < 11)
      return;
    const onlyDigits = input.value.replace(/\D/g, '').slice(0,11);
    const formatted = this.formatCpf(onlyDigits);
    const control = this.guardians.at(index);
    control.get('cpf')?.setValue(formatted, { emitEvent: false });
    if (this.validateCPF(formatted)) {
      this.checkGuardianByCpf(index);
    }
  }

  formatCepInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const onlyDigits = input.value.replace(/\D/g, '').slice(0,8);
    let formatted = onlyDigits;
    if (onlyDigits.length > 5) {
      formatted = onlyDigits.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
    this.basicInfo.get('cep')?.setValue(formatted, { emitEvent: false });
  }

  formatTelephoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const onlyDigits = input.value.replace(/\D/g, '').slice(0,11);
    let formatted = this.formatTelephone(onlyDigits);
    this.basicInfo.get('phoneNumber')?.setValue(formatted, { emitEvent: false });
  }

  formatTelephone(telephone: string): string {
    const onlyDigits = telephone.replace(/\D/g, '').slice(0,11);
    let formatted = onlyDigits;    
    if (onlyDigits.length > 10) {
      formatted = onlyDigits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }   
    else if (onlyDigits.length > 5) {
      formatted = onlyDigits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (onlyDigits.length > 2) {
      formatted = onlyDigits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    return formatted;
  }

  async checkGuardianByCpf(index: number) {
    const control = this.guardians.at(index);
    const cpfRaw = control.get('cpf')?.value || '';
    const cpfDigits = (cpfRaw || '').replace(/\D/g, '');
    if (!this.validateCPF(cpfRaw)) {
      control.get('cpf')?.setErrors({ invalidCpf: true });
      return;
    }
    control.get('loading')?.setValue(true);
    try {
      // First try the guardians endpoint
      const guardianResult: any = await firstValueFrom(this.guardiansService.getByCpf(cpfDigits));
      if (guardianResult) {
        control.get('name')?.setValue(guardianResult.name || '');
        control.get('id')?.setValue(guardianResult.id || guardianResult._id || '');
        control.get('name')?.disable({ emitEvent: false });
        control.get('exists')?.setValue(true);
        control.get('name')?.clearValidators();
      } else {
      //  // fallback to patient lookup
      //  const patientResult: any = await firstValueFrom(this.patientService.getByDocument(cpfDigits));
      //  if (patientResult) {
      //    const fullName = (patientResult.firstName ? patientResult.firstName : '') + (patientResult.lastName ? (' ' + patientResult.lastName) : '');
      //    control.get('name')?.setValue(fullName || patientResult.name || '');
      //    control.get('name')?.disable({ emitEvent: false });
      //    control.get('exists')?.setValue(true);
      //    control.get('name')?.clearValidators();
      //  } else {
      //    control.get('exists')?.setValue(false);
      //    control.get('name')?.enable({ emitEvent: false });
      //    control.get('name')?.setValidators([Validators.required]);
      //    control.get('name')?.updateValueAndValidity();
      //  }
      }
    } catch (err) {
      console.error('Error checking guardian by CPF', err);
      control.get('exists')?.setValue(false);
      control.get('name')?.enable({ emitEvent: false });
      control.get('name')?.setValidators([Validators.required]);
      control.get('name')?.updateValueAndValidity();
    } finally {
      control.get('loading')?.setValue(false);
    }
  }

  async onGuardianNameBlur(index: number) {
    const control = this.guardians.at(index);
    const name = control.get('name')?.value || '';
    const cpfRaw = control.get('cpf')?.value || '';
    const cpfDigits = (cpfRaw || '').replace(/\D/g, '');
    if (!name || !this.validateCPF(cpfRaw)) return;
    control.get('loading')?.setValue(true);
    try {
      const existingId = control.get('id')?.value;
      let result: any;
      if (existingId) {
        result = await firstValueFrom(this.guardiansService.update(existingId, { name, cpf: cpfDigits, phoneNumber: control.get('phoneNumber')?.value }));
      } else {
        result = await firstValueFrom(this.guardiansService.save({ name, cpf: cpfDigits, phoneNumber: control.get('phoneNumber')?.value } as any));
      }
      if (result) {
        // ensure form control reflects saved guardian
        control.patchValue({
          id: result.id || result._id || control.get('id')?.value,
          cpf: result.cpf || cpfDigits || control.get('cpf')?.value,
          name: result.name || name,
          phoneNumber: result.phoneNumber || control.get('phoneNumber')?.value,
          exists: true
        }, { emitEvent: false });
        control.get('name')?.disable({ emitEvent: false });
        control.get('name')?.clearValidators();
      }
    } catch (err) {
      console.error('Error saving guardian', err);
      this.snackBar.open('Erro ao salvar responsável', 'Fechar', { duration: 3000 });
    } finally {
      control.get('loading')?.setValue(false);
    }
  }

  private validateCPF(cpfRaw: string): boolean {
    const cpf = (cpfRaw || '').replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    const digits = cpf.split('').map(d => parseInt(d, 10));
    const calc = (len: number) => {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += digits[i] * (len + 1 - i);
      }
      const res = (sum * 10) % 11;
      return res === 10 ? 0 : res;
    };
    const v1 = calc(9);
    const v2 = calc(10);
    return v1 === digits[9] && v2 === digits[10];
  }

  async saveBasicInfo(step: any) {
    if (this.basicInfo.invalid) {
      this.markFormGroupTouched(this.basicInfo);
      return;
    }

    const cpfValue = this.basicInfo.get('cpf')?.value || '';
    if (!this.validateCPF(cpfValue)) {
      this.basicInfo.get('cpf')?.setErrors({ invalidCpf: true });
      this.snackBar.open('CPF inválido', 'Fechar', { duration: 3000 });
      return;
    }

    const payload: any = {
      id: this.patientId || "",
      firstName: this.basicInfo.value.firstName,
      document: (this.basicInfo.value.cpf || '').replace(/\D/g, ''),
      phoneNumber: this.basicInfo.value.phoneNumber,
      email: this.basicInfo.value.email,
      guardians: (this.basicInfo.value.guardians || []).map((r: any) => ({
        id: r.id || r._id || undefined,
        cpf: (r.cpf || '').toString().replace(/\D/g, ''),
        name: r.name,
        phoneNumber: r.phoneNumber || undefined
      })),
     // cep: this.basicInfo.value.cep
    };

    this.sending = true;
    try {
      //if (!this.patientId) {
      if (true) {
        const created: any = await firstValueFrom(this.patientService.create(payload));
        if (created && (created as any).id) {
          this.patientId = (created as any).id;
        }
      } else {
       // await firstValueFrom(this.patientService.update(this.patientId, payload));
      }
      this.notification.showSuccess('Informações básicas salvas com sucesso');
      step.next();
    } catch (err: any) {
      console.error('Error saving basic info', err);
      const msg = err?.error?.message || err?.message || 'Erro ao salvar';
      this.notification.showError('Erro ao salvar informações básicas: ' + msg);
    } finally {
      this.sending = false;
    }
  }

  async saveAgreementInfo(step: any) {
    if (this.agreementInfo.invalid) {
      this.markFormGroupTouched(this.agreementInfo);
      return;
    }

    const values = this.agreementInfo.value;
    console.log(values);
    const payload: any = {};
    if (values.hasHealthPlan) {
      payload.planCode = values.healthPlanId;
    } else {
      payload.modality = values.modalityId;
    }

    if (!this.patientId) {
      this.snackBar.open('Patient not created yet. Complete basic info first.', 'Fechar', { duration: 3000 });
      return;
    }

    this.sending = true;
    try {
      const result: any = await firstValueFrom( values.hasHealthPlan ? this.contractService.setPlan(this.patientId, payload) : this.contractService.setModality(this.patientId, payload));
      if (result) {
        this.contractId = result.id || result._id || result.contractId || this.contractId;
      }
      this.notification.showSuccess('Informação de contrato salva com sucesso');
      step.next();
    } catch (err: any) {
      console.error('Error saving agreement info', err);
      const msg = err?.error?.message || err?.message || 'Erro ao salvar';
      this.notification.showError('Erro ao salvar informação de contrato: ' + msg);
    } finally {
      this.sending = false;
    }
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
