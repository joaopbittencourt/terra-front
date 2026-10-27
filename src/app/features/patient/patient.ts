import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { Patient } from '../../shared/data/patient.interface';
import { PatientModel } from '../../shared/data/patient.model';
import { PatientService } from '../../shared/services/patient.service';
import { NotificationService } from '../../services/notification/notification';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-patient',
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
    RouterLink
  ],
  templateUrl: './patient.html',
  styleUrl: './patient.css'
})
export class PatientComponent implements OnInit, AfterViewInit {
  private notification = inject(NotificationService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'document',
    'phoneNumber',
    'email',
    'status',
    'actions'
  ];  
  // Placeholder data - this should come from a service
  dataSource = new MatTableDataSource<PatientModel>([]);
  private auth = inject(AuthenticationService);
  private isAccessAllowed = inject(AuthenticationService).hasRoles;

  constructor(private patientService:PatientService, private router: Router) {

  }

  ngOnInit(): void {
    if(this.auth.hasRoles(['ROLE_ADMIN', 'ROLE_ADMINASSISTANT', 'ROLE_RECEPCIONIST' ])){
      this.patientService.getAll().subscribe({
      next: (patients: PatientModel[]) => { this.dataSource.data = patients; },
      error: (err) => { console.error('Error loading patients', err); this.notification.showError('Erro ao carregar pacientes: ' + (err?.message || err)); }
    });
    }else if(this.auth.hasRoles(['ROLE_TERAPIST'])){
      this.patientService.getAllByTerapist().subscribe({
      next: (patients: PatientModel[]) => { this.dataSource.data = patients; },
      error: (err) => { console.error('Error loading patients', err); this.notification.showError('Erro ao carregar pacientes: ' + (err?.message || err)); }
    });
    } else{
      this.notification.showError('Acesso negado');
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  onEdit(patient: Patient): void {
    // Navigate to edit page
    this.router.navigate(['/patient', patient.id]);
    console.log('Edit patient:', patient);
  }

  onDelete(patient: Patient): void {
    // Show confirmation dialog and delete
    console.log('Delete patient:', patient);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
