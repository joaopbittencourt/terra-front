import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ServicePackage } from '../../shared/data/service-package.interface';
import { ServicePackageFormDialogComponent } from './service-package-form-dialog/service-package-form-dialog';
import { ServicePackageService } from '../../shared/services/service-package.service';
import { NotificationService } from '../../services/notification/notification';

@Component({
  selector: 'app-service-package',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './service-package.html',
  styleUrl: './service-package.css'
})
export class ServicePackageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['name', 'therapy', 'qtdSessions', 'price', 'active', 'actions'];

  dataSource = new MatTableDataSource<ServicePackage>([]);

  private notification = inject(NotificationService);

  constructor(private dialog: MatDialog, private servicePackageService: ServicePackageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadData(): void {
    this.servicePackageService.getAll().subscribe({
      next: (servicePackages: ServicePackage[]) => { this.dataSource.data = servicePackages; },
      error: (err) => { console.error('Error loading service packages:', err); this.notification.showError('Erro ao carregar pacotes de serviço: ' + (err?.message || err)); }
    });
  }

  openForm(servicePackage?: ServicePackage): void {
    const dialogRef = this.dialog.open(ServicePackageFormDialogComponent, {
      width: '600px',
      data: servicePackage || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.servicePackageService.create(result).subscribe({
          next: () => {
            this.loadData();
            this.notification.showSuccess('Pacote de serviço salvo com sucesso');
          },
          error: (err) => {
            console.error('Error saving service package:', err);
            this.notification.showError('Erro ao salvar pacote de serviço: ' + (err?.message || err));
          }
        });
      }
    });
  }

  onEdit(servicePackage: ServicePackage): void {
    this.openForm(servicePackage);
  }

  onDelete(servicePackage: ServicePackage): void {
    const name = servicePackage.name || 'Service Package';
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.servicePackageService.delete(servicePackage.id || '').subscribe({
        next: () => {
          this.loadData();
          this.notification.showSuccess('Pacote de serviço excluído com sucesso');
        },
        error: (err) => {
          console.error('Error deleting service package:', err);
          this.notification.showError('Erro ao excluir pacote de serviço: ' + (err?.message || err));
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
