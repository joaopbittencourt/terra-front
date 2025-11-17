import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { Paciente } from '../../shared/data/paciente.interface';
import { PacienteModel } from '../../shared/data/paciente.model';

@Component({
  selector: 'app-paciente',
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
  templateUrl: './paciente.html',
  styleUrl: './paciente.css'
})
export class PacienteComponent implements OnInit {
  displayedColumns: string[] = [
    'nomeCompleto',
    'cpf',
    'dataNascimento',
    'telefone',
    'email',
    'convenio',
    'ativo',
    'acoes'
  ];
  
  // Placeholder data - this should come from a service
  dataSource: Paciente[] = [
    new PacienteModel({
      id: '1',
      primeiroNome: 'João',
      sobrenome: 'Silva',
      cpf: '123.456.789-00',
      dataNascimento: '1990-01-01',
      telefone: '(11) 99999-9999',
      email: 'joao.silva@email.com',
      convenio: 'Unimed',
      ativo: true
    }),
    new PacienteModel({
      id: '2',
      primeiroNome: 'Maria',
      sobrenome: 'Santos',
      cpf: '987.654.321-00',
      dataNascimento: '1985-05-15',
      telefone: '(11) 88888-8888',
      email: 'maria.santos@email.com',
      convenio: 'Amil',
      ativo: true
    })
  ];

  ngOnInit(): void {
    // Here we'll later fetch data from the service
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  onEdit(paciente: Paciente): void {
    // Navigate to edit page
    console.log('Edit paciente:', paciente);
  }

  onDelete(paciente: Paciente): void {
    // Show confirmation dialog and delete
    console.log('Delete paciente:', paciente);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Implement filtering logic here
    console.log('Filter:', filterValue);
  }
}
