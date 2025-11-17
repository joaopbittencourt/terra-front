import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

import { Paciente } from '../../../../shared/data/paciente.interface';
import { PacienteModel } from '../../../../shared/data/paciente.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.css'
})
export class PacienteFormComponent implements OnInit {
  form: FormGroup;
  generoOpcoes = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'outro', label: 'Outro' },
    { value: 'nao_informado', label: 'Não Informado' }
  ];

  private createResponsavelFormGroup() {
    return this.fb.group({
      nome: ['', [Validators.required]],
      parentesco: [''],
      telefone: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
  }

  addResponsavel() {
    const responsaveis = this.form.get('responsaveis') as FormArray;
    responsaveis.push(this.createResponsavelFormGroup());
  }

  removeResponsavel(index: number) {
    const responsaveis = this.form.get('responsaveis') as FormArray;
    responsaveis.removeAt(index);
  }

  getResponsaveis() {
    return (this.form.get('responsaveis') as FormArray).controls;
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      primeiroNome: ['', [Validators.required]],
      sobrenome: ['', [Validators.required]],
      email: ['', [Validators.email]],
      dataNascimento: [null, [Validators.required]],
      telefone: [''],
      genero: ['nao_informado'],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      rg: [''],
      ativo: [true],
      endereco: this.fb.group({
        rua: [''],
        numero: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: [''],
        cep: [''],
        pais: ['Brasil']
      }),
      responsaveis: this.fb.array([]),
      convenio: [''],
      numeroProntuario: [''],
      alturaCm: [null],
      pesoKg: [null],
      alergias: [''],
      historicoMedico: [''],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    // Carregar dados se for edição
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const paciente = new PacienteModel({
        ...formValue,
        alergias: formValue.alergias ? formValue.alergias.split(',').map((a: string) => a.trim()) : [],
        historicoMedico: formValue.historicoMedico ? formValue.historicoMedico.split(',').map((h: string) => h.trim()) : []
      });

      // Aqui vamos salvar o paciente
      console.log('Salvando paciente:', paciente.toJSON());
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Campo obrigatório';
    }
    if (control.hasError('email')) {
      return 'Email inválido';
    }
    if (control.hasError('pattern')) {
      return 'Formato inválido';
    }
    return '';
  }
}