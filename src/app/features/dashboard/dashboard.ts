import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../shared/services/schedule.service';
import { PatientService } from '../../shared/services/patient.service';
import { TherapistService } from '../../shared/services/therapist.service';
import { HealthPlanService } from '../../shared/services/health-plan.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private auth = inject(AuthenticationService);
  private router = inject(Router);
  private notificationsService = inject(NotificationService);
  private scheduleService = inject(ScheduleService);
  private patientService = inject(PatientService);
  private therapistService = inject(TherapistService);
  private healthPlanService = inject(HealthPlanService);
  private subscriptions: Subscription[] = [];

  scheduledTherapiesCount: number = 0;
  patientsCount: number = 0;
  therapistsCount: number = 0;
  healthPlansCount: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    if (this.auth.hasRoles(['ROLE_TERAPIST'])) {
      void this.router.navigate(['/dashboard/terapeuta']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      
      if (params['error'] === 'accessDenied') {
        this.notificationsService.showError('Acesso negado. Você não tem permissão para acessar este recurso.');
      }
    });

    // Subscribe to counts
    this.subscriptions.push(
      this.scheduleService.getActiveSchedules().subscribe(schedules => this.scheduledTherapiesCount = schedules?.length || 0)
    );

    this.subscriptions.push(
      this.patientService.getAll().subscribe(patients => this.patientsCount = patients?.length || 0)
    );

    this.subscriptions.push(
      this.therapistService.getAll().subscribe(therapists => this.therapistsCount = therapists?.length || 0)
    );

    this.subscriptions.push(
      this.healthPlanService.getAll().subscribe(plans => this.healthPlansCount = plans?.length || 0)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
