import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Guide } from '../../shared/data/guide.interface';
import { PatientModel } from '../../shared/data/patient.model';
import { healthInsurance } from '../../shared/data/health-plan.interface';
import { GuideService } from '../../shared/services/guide.service';
import { PatientService } from '../../shared/services/patient.service';
import { HealthPlanService } from '../../shared/services/health-plan.service';
import { NotificationService } from '../../services/notification/notification';
import { GuideFormDialogComponent } from './guide-form-dialog/guide-form-dialog';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule],
  templateUrl: './guide.html',
  styleUrl: './guide.css'
})
export class GuideComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  readonly displayedColumns = ['patient', 'healthPlan', 'guideNumber', 'authorizationCode', 'expirationDate', 'sessions', 'status', 'actions'];
  guides = new MatTableDataSource<Guide>([]);
  patients: PatientModel[] = [];
  healthPlans: healthInsurance[] = [];
  private readonly notification = inject(NotificationService);

  constructor(
    private readonly guideService: GuideService,
    private readonly patientService: PatientService,
    private readonly healthPlanService: HealthPlanService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientService.getAll().subscribe(patients => this.patients = patients);
    this.patientService.refreshPatients();
    this.loadGuides();
  }

  ngAfterViewInit(): void {
    this.guides.paginator = this.paginator;
  }

  patientName(patientId: string): string {
    const patient = this.patients.find(item => item.id === patientId);
    return patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Paciente não encontrado';
  }

  healthPlanName(healthPlanId: string): string {
    const plan = this.healthPlans.find(item => item.id === healthPlanId);
    return plan ? `${plan.name} (ANS ${plan.registrationNumber})` : 'Plano não encontrado';
  }

  loadGuides(): void {
    this.guideService.getAll().subscribe({
      next: guides => this.guides.data = guides,
      error: () => this.guides.data = []
    });
  }

  openForm(guide: Guide | null = null): void {
    this.dialog.open(GuideFormDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      data: guide
    }).afterClosed().subscribe((result: Guide | undefined) => {
      if (!result) return;

      const operation = result.id ? this.guideService.update(result) : this.guideService.create(result);
      operation.subscribe({
        next: () => {
          this.loadGuides();
          this.notification.showSuccess('Guia salva com sucesso');
        },
        error: error => this.notification.showError('Erro ao salvar guia: ' + (error?.message || error))
      });
    });
  }

  deleteGuide(guide: Guide): void {
    if (!confirm(`Tem certeza que deseja excluir a guia ${guide.guideNumber}?`)) return;

    this.guideService.delete(guide.id).subscribe({
      next: () => {
        this.loadGuides();
        this.notification.showSuccess('Guia excluída com sucesso');
      },
      error: error => this.notification.showError('Erro ao excluir guia: ' + (error?.message || error))
    });
  }
}