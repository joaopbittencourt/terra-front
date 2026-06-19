import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PatientStepperComponent } from './patient-stepper';
import { PatientService } from '../../../../shared/services/patient.service';
import { HealthPlanService } from '../../../../shared/services/health-plan.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TherapyService } from '../../../../shared/services/therapy.service';
import { TherapistService } from '../../../../shared/services/therapist.service';
import { ContractService } from '../../../../shared/services/contract.service';
import { SessionIdEnum } from '../../../../shared/data/session-id.enum';

describe('PatientStepperComponent', () => {
  let component: PatientStepperComponent;
  let fixture: ComponentFixture<PatientStepperComponent>;
  let mockPatientService: jasmine.SpyObj<PatientService>;
  let mockHealthPlanService: jasmine.SpyObj<HealthPlanService>;
  let mockTherapyService: jasmine.SpyObj<TherapyService>;
  let mockTherapistService: jasmine.SpyObj<TherapistService>;
  let mockContractService: jasmine.SpyObj<ContractService>;

  beforeEach(async () => {
    mockPatientService = jasmine.createSpyObj('PatientService', ['create', 'update'], { loading$: of(false) });
    mockPatientService.create.and.returnValue(of({ id: 'new-id' } as any));
    mockPatientService.update.and.returnValue(of({} as any));

    mockHealthPlanService = jasmine.createSpyObj('HealthPlanService', ['getAll']);
    mockHealthPlanService.getAll.and.returnValue(of([]));

    mockTherapyService = jasmine.createSpyObj('TherapyService', ['getAll']);
    mockTherapyService.getAll.and.returnValue(of([{ id: 'th1', name: 'Terapia 1' }]));

    mockTherapistService = jasmine.createSpyObj('TherapistService', ['getAll']);
    mockTherapistService.getAll.and.returnValue(of([{
      id: 'ther1',
      name: 'Therapist 1',
      username: 'ther1',
      email: 'ther1@example.com',
      cpf: '00000000000',
      therapies: ['th1'],
      sessionsId: [SessionIdEnum.SEG_0800]
    }]));

    mockContractService = jasmine.createSpyObj('ContractService', ['create']);
    mockContractService.create.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [PatientStepperComponent],
      providers: [
        { provide: PatientService, useValue: mockPatientService },
        { provide: HealthPlanService, useValue: mockHealthPlanService },
        { provide: TherapyService, useValue: mockTherapyService },
        { provide: TherapistService, useValue: mockTherapistService },
        { provide: ContractService, useValue: mockContractService },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate cpf mask and validation function', () => {
    const validCpf = '111.444.777-35'; // valid
    expect((component as any).validateCPF(validCpf)).toBeTrue();
    expect((component as any).validateCPF('000.000.000-00')).toBeFalse();
  });

  it('should create patient on saveBasicInfo when no id', async () => {
    component.basicInfo.patchValue({
      firstName: 'Test',
      cpf: '111.444.777-35',
      phoneNumber: '999999999',
      email: 'a@b.com',
      guardians: [{ cpf: '111.444.777-35', name: 'Parent' }],
      cep: '00000-000'
    });
    // fake stepper with next()
    const stepper: any = { next: () => {} };
    await (component as any).saveBasicInfo(stepper);
    expect(mockPatientService.create).toHaveBeenCalled();
    expect(component.patientId).toBe('new-id');
  });

  it('should update patient with planCode when hasHealthPlan is true', async () => {
    component.patientId = 'new-id';
    component.agreementInfo.patchValue({ hasHealthPlan: true, healthPlanId: 'hp1' });
    const stepper: any = { next: () => {} };
    await (component as any).saveAgreementInfo(stepper);
    expect(mockPatientService.update).toHaveBeenCalledWith('new-id', { planCode: 'hp1' });
  });

  it('should update patient with modality when hasHealthPlan is false', async () => {
    component.patientId = 'new-id';
    component.agreementInfo.patchValue({ hasHealthPlan: false, modality: 'Multidisciplinar' });
    const stepper: any = { next: () => {} };
    await (component as any).saveAgreementInfo(stepper);
    expect(mockPatientService.update).toHaveBeenCalledWith('new-id', { modality: 'Multidisciplinar' });
  });

  it('should create contract when saving therapy info', async () => {
    component.patientId = 'pid';
    // ensure therapies/therapists loaded
    component.loadTherapiesAndTherapists();
    // start with one assignment
    component.assignments.clear();
    component.addAssignment();
    // set values
    const assign = component.assignments.at(0);
    assign.get('therapyId')?.setValue('th1');
    assign.get('therapistId')?.setValue('ther1');
    // toggle a session
    (component as any).toggleSession(0, SessionIdEnum.SEG_0800);

    const stepper: any = { next: () => {} };
    await (component as any).saveTherapyInfo(stepper);
    expect(mockContractService.create).toHaveBeenCalled();
  });
});
