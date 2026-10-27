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
import { MatChipsModule } from '@angular/material/chips';

import { Therapy as TherapyInterface } from '../../shared/data/therapy.interface';
import { TherapyFormDialogComponent } from './therapy-form-dialog/therapy-form-dialog';
import { TherapyService } from '../../shared/services/therapy.service';
import { NotificationService } from '../../services/notification/notification';

@Component({
  selector: 'app-therapy',
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
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './therapy.html',
  styleUrl: './therapy.css'
})
export class TherapyComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  //displayedColumns: string[] = ['name', 'modalities', 'active', 'actions'];
  displayedColumns: string[] = ['name', 'active', 'actions'];

  dataSource = new MatTableDataSource<TherapyInterface>([]);

  private notification = inject(NotificationService);

  constructor(private dialog: MatDialog, private therapyService:TherapyService) {}

  ngOnInit(): void {
    this.therapyService.getAll().subscribe({
      next: (therapies: TherapyInterface[]) => { this.dataSource.data = therapies; },
      error: (err) => { console.error('Error loading therapies', err); this.notification.showError('Erro ao carregar terapias: ' + (err?.message || err)); }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  openForm(therapy?: TherapyInterface): void {
    const dialogRef = this.dialog.open(TherapyFormDialogComponent, {
      width: '600px',
      data: therapy
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.create(result).subscribe({
          next: () => {
            this.therapyService.refreshTherapies();
            this.notification.showSuccess('Terapia salva com sucesso');
          },
          error: (err) => {
            console.error('Error saving therapy', err);
            this.notification.showError('Erro ao salvar terapia: ' + (err?.message || err));
          }
        });
      }
    });
  }

  onEdit(therapy: TherapyInterface): void {
    this.openForm(therapy);
  }

  onDelete(therapy: TherapyInterface): void {
    const name = therapy.name || 'Therapy';
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.dataSource.data = this.dataSource.data.filter(t => t.id !== therapy.id);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  //getModalities(therapy: TherapyInterface): string {
  //  const values = therapy.values;
  //  if (!values || values.length === 0) return '';
  //  return values.map(v => {
  //    const modality = typeof v.modality === 'string' ? v.modality : (v.modality?.modality || '');
  //    const price = v.value || 0;
  //    return `${modality} (R$ ${price.toFixed(2)})`;
  //  }).join(', ');
  //}
}
