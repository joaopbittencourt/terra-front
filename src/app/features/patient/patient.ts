import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
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
export class PatientComponent implements OnInit {
  private notification = inject(NotificationService);
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
  dataSource: PatientModel[] = [];

  constructor(private patientService:PatientService, private router: Router) {

  }

  ngOnInit(): void {
    this.patientService.getAll().subscribe({
      next: (patients: PatientModel[]) => { this.dataSource = patients; },
      error: (err) => { console.error('Error loading patients', err); this.notification.showError('Erro ao carregar pacientes: ' + (err?.message || err)); }
    });
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
    // Implement filtering logic here
    console.log('Filter:', filterValue);
  }
}
