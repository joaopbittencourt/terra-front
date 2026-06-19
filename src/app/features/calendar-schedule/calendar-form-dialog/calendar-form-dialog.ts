import { Component, Inject, inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ScheduleService } from '../../../shared/services/schedule.service';
import { Schedule } from '../../../shared/data/schedule.interface';
import { SessionIdEnum } from '../../../shared/data/session-id.enum';
import { NotificationService } from '../../../services/notification/notification';

interface DialogData {
  mode: 'create' | 'edit' | 'register';
  schedule?: Schedule;
}

@Component({
  selector: 'app-calendar-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSlideToggleModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  templateUrl: './calendar-form-dialog.html',
  styleUrl: './calendar-form-dialog.css'
})
export class CalendarFormDialogComponent {

  private readonly scheduleService = inject(ScheduleService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CalendarFormDialogComponent>);
  readonly data:any = inject(MAT_DIALOG_DATA) as DialogData;
  private readonly dateAdapter = inject(DateAdapter);
  private readonly notification = inject(NotificationService);

  // Display fields for register mode
  displayPatientName: string | null = null;
  displayTherapistName: string | null = null;
  displayTherapyName: string | null = null;
  displaySessionLabel: string | null = null;

  form: FormGroup;
  isSubmitting = false;

  // Allowed weekday filter (0 = Sunday ... 6 = Saturday). Null = no restriction
  allowedWeekday: number | null = null;

  // Date filter for mat-datepicker
  allowedDatesFilter = (d: Date | null): boolean => {
    if (!d) return false;
    if (this.allowedWeekday === null) return true;
    return d.getDay() === this.allowedWeekday;
  }

  // SessionIdEnum options for time slots
  sessionIdOptions: { value: string; label: string }[] = this.generateSessionIdOptions();

  constructor() {
       registerLocaleData(localePt);
    try {
      this.dateAdapter.setLocale('pt-BR');
    } catch (e) {
      // ignore if adapter doesn't support setLocale
      console.warn('dateAdapter.setLocale failed', e);
    }
    if (this.data?.mode === 'register' && this.data.schedule) {
      // For register mode, only need a description field
      this.displayPatientName = `${this.data.schedule.contract.patient.firstName} ${this.data.schedule.contract.patient.lastName != null ? this.data.schedule.contract.patient.lastName : ''}`;
      this.displayTherapistName = this.data.schedule.therapist?.name || null;
      this.displayTherapyName = this.data.schedule.therapy?.name || null;
      this.displaySessionLabel = this.formatSessionIdLabel(this.data.schedule.sessionIdEnum?.toString() || '');

      this.form = this.fb.group({
        date: [this.data.schedule?.date ? new Date(this.data.schedule.date) : '', Validators.required],
        description: ['', Validators.required]
      });
      return;
    }

    this.form = this.fb.group({
      date: ['', Validators.required],
      sessionId: ['', Validators.required],
      contract: ['', Validators.required],
      patient: ['', Validators.required],
      team: ['', Validators.required],
      discipline: ['', Validators.required],
      status: [true, Validators.required]
    });

    if (this.data?.mode === 'edit' && this.data.schedule) {
      this.populateForm(this.data.schedule);
    }

    // Listen to sessionId changes to update allowed weekday
    const sessionControl = this.form.get('sessionId');
    if (sessionControl) {
      sessionControl.valueChanges.subscribe((val: string) => {
        this.updateAllowedWeekdayFromSessionId(val);
        // revalidate date
        const dateControl = this.form.get('date');
        if (dateControl && dateControl.value) {
          const valid = this.allowedDatesFilter(new Date(dateControl.value));
          if (!valid) {
            dateControl.setErrors({ weekdayMismatch: true });
          } else {
            // remove weekdayMismatch error if present
            const errors = dateControl.errors;
            if (errors) {
              delete errors['weekdayMismatch'];
              if (Object.keys(errors).length === 0) {
                dateControl.setErrors(null);
              } else {
                dateControl.setErrors(errors);
              }
            }
          }
        }
      });
    }

    // If opened in register mode with schedule provided, initialize allowedWeekday
    if (this.data?.mode === 'register' && this.data.schedule?.sessionIdEnum) {
      this.updateAllowedWeekdayFromSessionId(this.data.schedule.sessionIdEnum.toString());
    }
  }

  private populateForm(schedule: Schedule): void {
    this.form.patchValue({
      date: new Date(schedule.date),
      sessionId: schedule.sessionIdEnum?.toString(),
      contract: schedule.contract.id,
      patient: schedule.contract.patient.id,
      team: schedule.team.id,
      discipline: schedule.discipline.id,
      status: schedule.status
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.form.value;
    const scheduleData: Partial<Schedule> = {
      date: new Date(formValue.date),
      sessionIdEnum: formValue.sessionId,
      status: formValue.status
      // Note: contract, patient, team, discipline would be mapped to their full objects
      // In a real scenario, you'd fetch these by ID from the backend
    };

    if (this.data?.mode === 'create') {
      this.scheduleService.create(scheduleData as Schedule).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.notification.showSuccess('Agendamento criado com sucesso');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notification.showError('Erro ao criar agendamento: ' + (err?.message || err));
        }
      });
    } else if (this.data?.mode === 'edit' && this.data.schedule?.id) {
      this.scheduleService.update(this.data.schedule.id, scheduleData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.notification.showSuccess('Agendamento atualizado com sucesso');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notification.showError('Erro ao atualizar agendamento: ' + (err?.message || err));
        }
      });
    } else if (this.data?.mode === 'register' && this.data.schedule?.id) {
      // Register session (send prontuário + date)
      const desc = this.form.get('description')?.value;
      const dateVal = this.form.get('date')?.value;
      const isoDate = dateVal ? (new Date(dateVal)).toISOString() : undefined;
      this.isSubmitting = true;
      this.scheduleService.registerSession(this.data.schedule.id, desc, isoDate).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.notification.showSuccess('Sessão registrada com sucesso');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notification.showError('Erro ao registrar sessão: ' + (err?.message || err));
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private generateSessionIdOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];

    Object.keys(SessionIdEnum).forEach(key => {
      if (!isNaN(Number(SessionIdEnum[key as any]))) {
        const label = this.formatSessionIdLabel(key);
        options.push({
          value: key,
          label
        });
      }
    });

    return options;
  }

  private formatSessionIdLabel(sessionId: string): string {
    // Format like "SEG_0800" to "Segunda-feira 08:00"
    const dayMap: { [key: string]: string } = {
      'SEG': 'Segunda-feira',
      'TER': 'Terça-feira',
      'QUA': 'Quarta-feira',
      'QUI': 'Quinta-feira',
      'SEX': 'Sexta-feira',
      'SAB': 'Sábado'
    };

    const parts = sessionId.split('_');
    const day = dayMap[parts[0]] || parts[0];
    const time = parts[1] ? parts[1].substring(0, 2) + ':' + parts[1].substring(2) : '';

    return `${day} - ${time}`;
  }

  private updateAllowedWeekdayFromSessionId(sessionId?: string | null): void {
    if (!sessionId) {
      this.allowedWeekday = null;
      return;
    }
    const prefix = sessionId.split('_')[0];
    switch (prefix) {
      case 'DOM': this.allowedWeekday = 0; break;
      case 'SEG': this.allowedWeekday = 1; break;
      case 'TER': this.allowedWeekday = 2; break;
      case 'QUA': this.allowedWeekday = 3; break;
      case 'QUI': this.allowedWeekday = 4; break;
      case 'SEX': this.allowedWeekday = 5; break;
      case 'SAB': this.allowedWeekday = 6; break;
      default: this.allowedWeekday = null; break;
    }
  }
}
