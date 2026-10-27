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

import { Therapist } from '../../shared/data/therapist.interface';
import { TherapistFormDialogComponent } from './therapist-form-dialog/therapist-form-dialog';
import { TherapistService } from '../../shared/services/therapist.service';
import { TherapyService } from '../../shared/services/therapy.service';
import { Therapy } from '../../shared/data/terapia.interface';
import { NotificationService } from '../../services/notification/notification';

@Component({
  selector: 'app-therapist',
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
  templateUrl: './therapist.html',
  styleUrl: './therapist.css'
})
export class TherapistComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['name', 'email', 'cpf', 'professionalRegistration', 'therapies', 'active', 'actions'];

  dataSource = new MatTableDataSource<Therapist>([]);

  // Sample therapies for the form
  availableTherapies: Therapy[] = [];

  private notification = inject(NotificationService);

  constructor(private dialog: MatDialog, private therapistService: TherapistService,
    private therapyService: TherapyService
  ) {}

  ngOnInit(): void {
    // Aqui vamos carregar dados do serviço
    this.therapistService.getAll().subscribe((therapists: Therapist[]) => {
      this.dataSource.data = therapists;
      this.getAllTherapies(); // Carrega as terapias disponíveis
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  openForm(therapist?: Therapist): void {
    const dialogRef = this.dialog.open(TherapistFormDialogComponent, {
      width: '90%',
      data: {
        therapist: therapist || null,
        availableTherapies: this.availableTherapies,
        terapeuta: therapist || null,
        terapiasDisponiveis: this.availableTherapies
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapistService.create(result).subscribe({
          next: () => {
            this.therapistService.refreshTherapists();
            this.notification.showSuccess('Terapeuta salvo com sucesso');
          },
          error: (err: any) => {
            console.error('Error saving therapist', err);
            this.notification.showError('Erro ao salvar terapeuta: ' + (err?.message || err));
          }
        });
      }
    });
  }
  getAllTherapies(): any {
    this.therapyService.getAll().subscribe((therapy: Therapy[]) => {
      this.availableTherapies = therapy;
    });
  }

  onEdit(therapist: Therapist): void {
    this.openForm(therapist);
  }

  onDelete(therapist: Therapist): void {
    const name = therapist.name || 'Therapist';
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.dataSource.data = this.dataSource.data.filter(t => t.id !== therapist.id);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getTherapiesText(therapies?: string[]): string {
    if (!therapies || therapies.length === 0) return 'No therapies';
    return therapies.join(', ');
  }
}