import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { CalendarScheduleComponent } from './calendar-schedule';
import { ScheduleService } from '../../shared/services/schedule.service';
import { TherapistService } from '../../shared/services/therapist.service';
import { PatientService } from '../../shared/services/patient.service';

describe('CalendarScheduleComponent', () => {
  let component: CalendarScheduleComponent;
  let fixture: ComponentFixture<CalendarScheduleComponent>;
  let mockScheduleService: jasmine.SpyObj<ScheduleService>;
  let mockTherapistService: jasmine.SpyObj<TherapistService>;
  let mockPatientService: jasmine.SpyObj<PatientService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockScheduleService = jasmine.createSpyObj('ScheduleService', ['getAll', 'refresh', 'delete'], {
      loading$: of(false),
      error$: of(null),
      schedules$: of([])
    });

    mockTherapistService = jasmine.createSpyObj('TherapistService', ['getAll']);
    mockPatientService = jasmine.createSpyObj('PatientService', ['getAll']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [CalendarScheduleComponent, ReactiveFormsModule],
      providers: [
        { provide: ScheduleService, useValue: mockScheduleService },
        { provide: TherapistService, useValue: mockTherapistService },
        { provide: PatientService, useValue: mockPatientService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle view mode between week and month', () => {
    expect(component.viewMode$.value).toBe('week');
    component.toggleViewMode();
    expect(component.viewMode$.value).toBe('month');
    component.toggleViewMode();
    expect(component.viewMode$.value).toBe('week');
  });

  it('should navigate to previous week', () => {
    const initialDate = component.selectedDate$.value;
    component.previousWeek();
    const newDate = component.selectedDate$.value;
    expect(newDate.getTime()).toBeLessThan(initialDate.getTime());
  });

  it('should navigate to next week', () => {
    const initialDate = component.selectedDate$.value;
    component.nextWeek();
    const newDate = component.selectedDate$.value;
    expect(newDate.getTime()).toBeGreaterThan(initialDate.getTime());
  });

  it('should open create dialog', () => {
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    component.openCreateDialog();
    expect(mockDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      width: '600px',
      data: { mode: 'create' }
    });
  });

  it('should delete schedule on confirmation', () => {
    mockScheduleService.delete.and.returnValue(of(void 0));
    spyOn(window, 'confirm').and.returnValue(true);

    const schedule: any = { id: '1', date: new Date(), status: true };
    component.deleteSchedule(schedule);

    expect(mockScheduleService.delete).toHaveBeenCalledWith('1');
  });

  it('should not delete schedule without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    const schedule: any = { id: '1', date: new Date(), status: true };
    component.deleteSchedule(schedule);

    expect(mockScheduleService.delete).not.toHaveBeenCalled();
  });

  it('should generate time slots from 7:00 to 19:30', () => {
    const slots = component.timeSlots;
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toBe('07:00');
    expect(slots[slots.length - 1]).toBe('19:30');
  });

  it('should format date correctly', () => {
    const date = new Date('2026-04-01');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('01');
    expect(formatted).toContain('2026');
  });
});
