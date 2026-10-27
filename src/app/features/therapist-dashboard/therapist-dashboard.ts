import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { PatientService } from '../../shared/services/patient.service';
import { ScheduleService } from '../../shared/services/schedule.service';
import { TherapistService } from '../../shared/services/therapist.service';
import { Schedule } from '../../shared/data/schedule.interface';

@Component({
  selector: 'app-therapist-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './therapist-dashboard.html',
  styleUrl: '../dashboard/dashboard.css'
})
export class TherapistDashboard implements OnInit, OnDestroy {
  private readonly auth = inject(AuthenticationService);
  private readonly patientService = inject(PatientService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly therapistService = inject(TherapistService);
  private subscription?: Subscription;

  therapistName = this.auth.userName || 'Terapeuta';
  patientsCount = 0;
  scheduledTherapiesCount = 0;
  todayAppointmentsCount = 0;

  ngOnInit(): void {
    this.subscription = combineLatest([
      this.therapistService.getAll(),
      this.scheduleService.getActiveSchedulesByTerapist(),
      this.patientService.getAllByTerapist()
    ]).subscribe(([therapists, schedules, patients]) => {
      const username = this.auth.userName.trim().toLowerCase();
      const therapist = therapists.find(item => item.username?.trim().toLowerCase() === username);
      const therapistId = therapist?.id;
      const ownSchedules = schedules;

      this.therapistName = therapist?.name || this.auth.userName || 'Terapeuta';
      this.patientsCount = patients.length;
      this.scheduledTherapiesCount = ownSchedules.length;
      this.todayAppointmentsCount = ownSchedules.filter(schedule => this.isToday(schedule)).length;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private isToday(schedule: Schedule): boolean {
    const dayNames = ['DOM','SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return schedule.sessionIdEnum.toString().split("_")[0] === dayNames[new Date().getDay()];
  }
}