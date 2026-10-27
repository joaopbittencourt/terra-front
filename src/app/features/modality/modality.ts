import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
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

import { Modality as ModalityInterface } from '../../shared/data/modality.interface';
import { ModalityFormDialogComponent } from './modality-form-dialog/modality-form-dialog';
import { ModalityService } from '../../shared/services/modality.service';
import { NotificationService } from '../../services/notification/notification';

@Component({
  selector: 'app-modality',
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
  templateUrl: './modality.html',
  styleUrl: './modality.css'
})
export class ModalityComponent implements OnInit, AfterViewInit {
  private notification = inject(NotificationService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['modality', 'status', 'actions'];

  dataSource = new MatTableDataSource<ModalityInterface>([]);

  constructor(private dialog: MatDialog, private modalityService:ModalityService) {}

  ngOnInit(): void {
    // Load data from service
    this.modalityService.getAll().subscribe({
      next: (modalities: ModalityInterface[]) => { this.dataSource.data = modalities; },
      error: (err) => { console.error('Error loading modalities', err); this.notification.showError('Erro ao carregar modalidades: ' + (err?.message || err)); }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  openForm(modality?: ModalityInterface): void {
    const dialogRef = this.dialog.open(ModalityFormDialogComponent, {
      width: '500px',
      data: modality || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.modalityService.create(result).subscribe({
          next: () => {
            this.modalityService.refreshModalities();
            this.notification.showSuccess('Modalidade salva com sucesso');
          },
          error: (err: any) => {
            console.error('Error saving modality', err);
            this.notification.showError('Erro ao salvar modalidade: ' + (err?.message || err));
          }
        });
      }
    });
  }

  onEdit(modality: ModalityInterface): void {
    this.openForm(modality);
  }

  onDelete(modality: ModalityInterface): void {
    const name = modality.name  || 'Modality';
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.dataSource.data = this.dataSource.data.filter(m => m.id !== modality.id);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
