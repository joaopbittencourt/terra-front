import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { TherapistFormDialogComponent } from './therapist-form-dialog';
import { TherapyService } from '../../../shared/services/therapy.service';
import { NotificationService } from '../../../services/notification/notification';

describe('TherapistFormDialogComponent', () => {
  let component: TherapistFormDialogComponent;
  let fixture: ComponentFixture<TherapistFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapistFormDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: { therapist: null, availableTherapies: [] } },
        { provide: TherapyService, useValue: { getAll: () => of([]) } },
        {
          provide: NotificationService,
          useValue: {
            showError: jasmine.createSpy('showError'),
            showSuccess: jasmine.createSpy('showSuccess')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TherapistFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the percentage field when contract type is percentage', () => {
    component.form.patchValue({ contractType: 'percentage' });
    component.updateContractFieldsValidators('percentage');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Porcentagem');
  });

  it('shows the remuneration field when contract type is fixed', () => {
    component.form.patchValue({ contractType: 'fixed' });
    component.updateContractFieldsValidators('fixed');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Remuneração');
  });
});
