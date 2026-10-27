import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { healthInsurance } from '../../shared/data/health-plan.interface';
import { HealthPlanService } from '../../shared/services/health-plan.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HealthPlanFormDialog } from './form/health-plan-form-dialog';
import { NotificationService } from '../../services/notification/notification';

@Component({
  selector: 'app-health-plans',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './health-plan.html',
  styleUrl: './health-plan.css'
})
export class HealthPlansComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  plans = new MatTableDataSource<healthInsurance>([]);
  displayedColumns = ['name', 'effetiveDate', 'dateOfValidity', 'status', 'registrationNumber', 'actions'];
  private notification = inject(NotificationService);

  constructor(private healthPlanService: HealthPlanService, private dialog: MatDialog) {
    this.loadPlans();
  }

  ngAfterViewInit(): void {
    this.plans.paginator = this.paginator;
  }

  loadPlans() {
    this.healthPlanService.getAll().subscribe((plans: healthInsurance[]) => {
      console.log('Health Plans loaded:', plans);
      this.plans.data = plans;
    });
  }

  addPlan() {
    const dialogRef = this.dialog.open(HealthPlanFormDialog, {
      data: { plan: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlans();
      }
    });
  }

  editPlan(plan: healthInsurance) {
    const dialogRef = this.dialog.open(HealthPlanFormDialog, {
      data: { plan: plan }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlans();
      }
    });
  }

  deletePlan(id: string) {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      this.healthPlanService.delete(id).subscribe({
        next: () => {
          this.loadPlans();
          this.notification.showSuccess('Plano excluído com sucesso');
        },
        error: (err) => {
          this.notification.showError('Erro ao excluir plano: ' + (err?.message || err));
        }
      });
    }
  }
}
