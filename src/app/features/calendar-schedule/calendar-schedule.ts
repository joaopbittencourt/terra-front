import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CalendarFormDialogComponent } from './calendar-form-dialog/calendar-form-dialog';
import { Schedule } from '../../shared/data/schedule.interface';
import { ScheduleService } from '../../shared/services/schedule.service';
import { TherapistService } from '../../shared/services/therapist.service';
import { PatientService } from '../../shared/services/patient.service';

import { SessionIdEnum } from '../../shared/data/session-id.enum';
import { NotificationService } from '../../services/notification/notification';

interface ScheduleFilter {
  therapist: string;
  patient: string;
  discipline: string;
  status: string;
}

@Component({
  selector: 'app-calendar-schedule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './calendar-schedule.html',
  styleUrls: ['./calendar-schedule.css']
})
export class CalendarScheduleComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly therapistService = inject(TherapistService);
  private readonly patientService = inject(PatientService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  viewMode$ = new BehaviorSubject<'week' | 'month' | 'day'>('day');
  selectedDate$ = new BehaviorSubject<Date>(new Date());
  showOnlyDay$ = new BehaviorSubject<boolean>(false);

  schedules$: Observable<Schedule[]>;
  filteredSchedules$: Observable<Schedule[]>;

  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  filterForm: FormGroup;

  // For weekview - time slots
  timeSlots = this.generateTimeSlots();
  weekDays: { date: Date; dayName: string; dayNumber: number }[] = [];





  constructor() {
    this.schedules$ = this.scheduleService.getActiveSchedules();
    this.loading$ = this.scheduleService.loading$;
    this.error$ = this.scheduleService.error$;

    this.filterForm = this.fb.group({
      therapist: [''],
      patient: [''],
      discipline: [''],
      status: ['']
    });

    // Initialize filtered schedules with filter changes, selected date and show-only-day toggle
    this.filteredSchedules$ = combineLatest([
      this.schedules$,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)),
      this.selectedDate$,
      this.showOnlyDay$
    ]).pipe(
      map(([schedules, filters, selectedDate, showOnly]) => {
        let result = this.applyFilters(schedules, filters);
        if (showOnly) {
          result = result.filter(s => this.isSameDay(new Date(s.date), selectedDate));
        }
        return result;
      })
    );
  }

  ngOnInit(): void {
    console.log('CalendarScheduleComponent initialized');
    this.updateWeekDays();
  }

  toggleShowOnlyDay(): void {
    this.showOnlyDay$.next(!this.showOnlyDay$.value);
  }

  toggleViewMode(): void {
    const current = this.viewMode$.value;
    if (current === 'week') this.viewMode$.next('month');
    else if (current === 'month') this.viewMode$.next('day');
    else this.viewMode$.next('week');
  }

  setViewMode(mode: 'week' | 'month' | 'day'): void {
    this.viewMode$.next(mode);
  }

  previousWeek(): void {
    const current = this.selectedDate$.value;
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 7);
    this.selectedDate$.next(previous);
    this.updateWeekDays();
  }

  nextWeek(): void {
    const current = this.selectedDate$.value;
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.selectedDate$.next(next);
    this.updateWeekDays();
  }

  previousDay(): void {
    const current = this.selectedDate$.value;
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 1);
    this.selectedDate$.next(previous);
  }

  nextDay(): void {
    const current = this.selectedDate$.value;
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    this.selectedDate$.next(next);
  }

  selectDate(date: Date | null): void {
    if (date) {
      this.selectedDate$.next(date);
      this.updateWeekDays();
    }
  }

  goToPreviousNavigation(): void {
    const mode = this.viewMode$.value;
    if (mode === 'week') {
      this.previousWeek();
    } else {
      this.previousDay();
    }
  }

  goToNextNavigation(): void {
    const mode = this.viewMode$.value;
    if (mode === 'week') {
      this.nextWeek();
    } else {
      this.nextDay();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CalendarFormDialogComponent, {
      width: '1200px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.refresh();
      }
    });
  }

  openEditDialog(schedule: Schedule): void {
    const dialogRef = this.dialog.open(CalendarFormDialogComponent, {
      width: '1200px',
      data: { mode: 'edit', schedule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.refresh();
      }
    });
  }

  openRegisterDialog(schedule: Schedule): void {
    const dialogRef = this.dialog.open(CalendarFormDialogComponent, {
      width: '1200px',
      data: { mode: 'register', schedule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.refresh();
      }
    });
  }

  deleteSchedule(schedule: Schedule): void {
    if (confirm(`Deseja deletar o agendamento de ${this.formatDate(schedule.date)}?`)) {
      if (schedule.id) {
        this.scheduleService.delete(schedule.id).subscribe({
          next: () => {
            this.scheduleService.refresh();
            this.notification.showSuccess('Agendamento excluído com sucesso');
          },
          error: (err) => { 
            if (err?.status === 404) {
              this.notification.showError('Serviço não implementado para exclusão de agendamento. Por favor, contate o suporte.');
              //this.scheduleService.refresh();
            } else {  
              this.notification.showError('Erro ao excluir agendamento: ' + (err?.message || err));
            }
          }
        });
      }
    }
  }

  getSchedulesForDay(date: Date, schedules: Schedule[]): Schedule[] {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return this.isSameDay(scheduleDate, date);
    });
  }

  getMonthDays(): { date: Date; day: number; isCurrentMonth: boolean; schedules: Schedule[] }[] {
    const current = this.selectedDate$.value;
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const schedules = this.schedulesCache();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        schedules: this.getSchedulesForDay(date, schedules)
      });
    }

    return days;
  }

  getTimeSlotSchedules(date: Date, slot: string, schedules: Schedule[]): Schedule[] {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return this.isSameDay(scheduleDate, date) && schedule.sessionIdEnum.toString() === slot;
    });
  }

  getTimeSlotSchedulesByEnum(date: Date | null, slot: string, schedules: any[]): any[] {
    if (!date) return [];

      const dayWeekNames = [
        "DOM",     
        "SEG",
        "TER",
        "QUA",
        "QUI",
        "SEX",
        "SÁB"
        // Adicione os outros dias aqui
      ];
    return schedules.filter(schedule => {
     
      const scheduleWeekDay = schedule.sessionIdEnum.toString().split('_')[0];
      
      const scheduleHourDay = schedule.sessionIdEnum.toString().split('_')[1];
      const slotHourDay = `${scheduleHourDay.slice(0,2)}:${scheduleHourDay.slice(2,4)}`;
  
     // console.log('Comparando:', dayWeekNames[date.getDay()], scheduleWeekDay, 'com slot', scheduleHourDay, slot);
      return dayWeekNames[date.getDay()] === scheduleWeekDay && slotHourDay === slot;
    });
  }

  private applyFilters(schedules: Schedule[], filters: ScheduleFilter): Schedule[] {
    return schedules.filter(schedule => {
      if (filters.therapist && schedule.team?.id !== filters.therapist) {
        return false;
      }
      if (filters.patient && schedule.contract?.patient?.id !== filters.patient) {
        return false;
      }
      if (filters.discipline && schedule.discipline?.id !== filters.discipline) {
        return false;
      }
      if (filters.status !== '' && schedule.status !== (filters.status === 'active')) {
        return false;
      }
      return true;
    });
  }

  private updateWeekDays(): void {

    const current = this.selectedDate$.value;
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Start from Monday
    const monday = new Date(current.setDate(diff));

    this.weekDays = [];
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);

      this.weekDays.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate()
      });
    }
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    const startHour = 7;
    const endHour = 20;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private schedulesCache(): Schedule[] {
    let result: Schedule[] = [];
    this.schedules$.subscribe(schedules => {
      result = schedules;
    }).unsubscribe();
    // If "show only day" is active, filter cached schedules by the currently selected date
    if (this.showOnlyDay$?.value) {
      return result.filter(s => this.isSameDay(new Date(s.date), this.selectedDate$.value));
    }
    return result;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  formatTime(slot: string): string {
    return slot;
  }
}
