import { Routes } from '@angular/router';
import { Modalidade } from './features/modalidade/modalidade';
import { Planosaude } from './features/planosaude/planosaude';
import { Sessao } from './features/sessao/sessao';
import { Terapia } from './features/terapia/terapia';
import { AuthGuard } from './guard/auth-guard';
import { PacienteComponent } from './features/paciente/paciente';
import { PacienteFormComponent } from './features/paciente/pages/paciente-form/paciente-form';

export const routes: Routes = [
  {
    path: 'paciente',
    component: PacienteComponent,
    canActivate : [AuthGuard],
    data: {
        roles: ["Auxiliar", "Recepcionista", "Terapeura", "administrador"]
    }
  },
  {
    path: 'paciente/novo',
    component: PacienteFormComponent,
    canActivate : [AuthGuard],
    data: {
        roles: ["Auxiliar", "Recepcionista", "Terapeura", "administrador"]
    }
  },
  {
    path: 'modalidade',
    component: Modalidade,
    canActivate : [AuthGuard],
    data: {
      roles: ["Auxiliar", "Recepcionista", "Terapeura", "administrador"]
    }
  },
  {
    path: 'planosaude',
    component: Planosaude,
    canActivate : [AuthGuard],
    data: {
      roles: ["Auxiliar", "Recepcionista", "Terapeura", "administrador"]
    }
  },
  {
    path: 'sessao',
    component: Sessao,
    canActivate : [AuthGuard],
    data: {
      roles: ["Auxiliar", "Recepcionista", "Terapeura", "administrador"]
    }
  },
  {
    path: 'terapia',
    component: Terapia,
    canActivate : [AuthGuard],
    data: {
      roles: ["Auxiliar", "Recepcionista", "Terapeura", "administrador"]
    }
  },
];
