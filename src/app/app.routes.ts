import { Routes } from '@angular/router';
import { ModalityComponent } from './features/modality/modality';
import { HomeComponent } from './pages/home/home.component';
import { SessionComponent } from './features/session/session';
import { TherapyComponent } from './features/therapy/therapy';
import { TherapistComponent } from './features/therapist/therapist';
import { canActivateAuthRole } from './guard/auth.guard';
import { PatientComponent } from './features/patient/patient';
import { PatientFormComponent } from './features/patient/pages/patient-form/patient-form';
import { PatientStepperComponent } from './features/patient/pages/patient-stepper/patient-stepper';
import { PatientViewComponent } from './features/patient/pages/patient-view/patient-view';
import { HealthPlansComponent } from './features/health-plans/health-plan';
import { ServicePackageComponent } from './features/service-package/service-package';
import { CalendarScheduleComponent } from './features/calendar-schedule/calendar-schedule';
//import { AuthGuard } from './guard/auth-guard';
import { AppComponent } from './app';
import { Dashboard } from './features/dashboard/dashboard';
import { TherapistDashboard } from './features/therapist-dashboard/therapist-dashboard';
import { GuideComponent } from './features/guide/guide';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate : [canActivateAuthRole],
    data: {
        roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_TERAPIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'dashboard/terapeuta',
    component: TherapistDashboard,
    canActivate: [canActivateAuthRole],
    data: {
      roles: ['ROLE_TERAPIST']
    }
  },
  {
    path: 'patient',
    component: PatientComponent,
    canActivate : [canActivateAuthRole],
    data: {
        roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_TERAPIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'patient/new',
    component: PatientStepperComponent,
    canActivate : [canActivateAuthRole],
    data: {
        roles: ["ROLE_ADMINASSISTANT",  "ROLE_RECEPTIONIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'patient/:patientId',
    component: PatientStepperComponent,
    canActivate : [canActivateAuthRole],
    data: {
        roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_ADMIN", "ROLE_TERAPIST"]
    }
  },
  {
    path: 'patient-view/:id',
    component: PatientViewComponent,
    canActivate: [canActivateAuthRole],
    data: { 
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_TERAPIST", "ROLE_ADMIN", "ROLE_TERAPIST"] 
    }
  },
  {
    path: 'modality',
    component: ModalityComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'health-plans',
    component: HealthPlansComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'guides',
    component: GuideComponent,
    canActivate: [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'session',
    component: SessionComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_TERAPIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'therapy',
    component: TherapyComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'therapist',
    component: TherapistComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_ADMIN"]
    }
  },
  {
    path: 'service-package',
    component: ServicePackageComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_ADMIN"]
    }
  },
  {
    path: 'calendar-schedule',
    component: CalendarScheduleComponent,
    canActivate : [canActivateAuthRole],
    data: {
      roles: ["ROLE_ADMINASSISTANT", "ROLE_RECEPTIONIST", "ROLE_TERAPIST", "ROLE_ADMIN"]
    }
  },
  // Keep old routes for backward compatibility
  {
    path: 'paciente',
    redirectTo: '/patient'
  },
  {
    path: 'paciente/novo',
    redirectTo: '/patient/new'
  },
  {
    path: 'modalidade',
    redirectTo: '/modality'
  },
  {
    path: 'planosaude',
    redirectTo: '/health-plans'
  },
  {
    path: 'sessao',
    redirectTo: '/session'
  },
  {
    path: 'terapia',
    redirectTo: '/therapy'
  },
  {
    path: 'terapeuta',
    redirectTo: '/therapist'
  },
];
