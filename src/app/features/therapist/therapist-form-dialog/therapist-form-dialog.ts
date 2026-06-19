import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

import { Therapist } from '../../../shared/data/therapist.interface';
import { Therapy } from '../../../shared/data/therapy.interface';
import { TherapistService } from '../../../shared/services/therapist.service';
import { TherapyService } from '../../../shared/services/therapy.service';
import { NotificationService } from '../../../services/notification/notification';
import { SessionIdEnum } from '../../../shared/data/session-id.enum';
interface DialogData {
  therapist: Therapist | null;
  availableTherapies: Array<Therapy>;
  terapeuta?: any;
}

@Component({
  selector: 'app-therapist-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './therapist-form-dialog.html',
  styleUrl: './therapist-form-dialog.css'
})
export class TherapistFormDialogComponent implements OnInit {
  form: FormGroup;
  availableTherapies: Array<Therapy> = [];
  selectedTherapies: Therapy[] = [];
  sessionsList: any[] = [];
  selectedSessions: string[] = [];
  days: string[] = []; // Ex: ['SEG', 'TER', 'QUA'...]
  sessionRows: any[][] = []; // Matriz para a tabela

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TherapistFormDialogComponent>,
    private therapyService: TherapyService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      phoneNumber: [''],
      professionalRegistration: ['', [Validators.required]],
      active: [true],
      therapies: [[]],
      sessionsId: [[]]
    });
  }

  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.getAllTherapies();
    this.getAllSessions();
 
    if (this.data) {
      this.availableTherapies = this.data.availableTherapies;

      if (this.data.therapist || this.data.terapeuta) {
        const therapist = this.data.therapist || this.data.terapeuta;
        this.form.patchValue({
          id: therapist.id,
          name: therapist.name || therapist.nome,
          username: therapist.username || therapist.usuario,
          email: therapist.email,
          cpf: therapist.cpf,
          phoneNumber: therapist.phoneNumber || therapist.telefone,
          professionalRegistration: therapist.professionalRegistration || therapist.registroOrgao,
          active: therapist.active !== undefined ? therapist.active : therapist.ativo,
          sessionsId: therapist.sessionsId || []
        });

        if (therapist.therapies || therapist.terapias) {
          this.selectedTherapies = [...(therapist.therapies || therapist.terapias)];
          this.form.patchValue({ therapies: this.selectedTherapies });
        }
        if (therapist.sessionsId || therapist.sessoesId) {
          this.selectedSessions = [...(therapist.sessionsId || therapist.sessoesId)];
          this.form.patchValue({ sessionsId: this.selectedSessions });
        }
      }
    }
  }

  getAllSessions(): void {
    this.sessionsList = SessionIdEnum ? Object.keys(SessionIdEnum).filter(key => isNaN(Number(key))) : [];
    this.organizeTable();
  }

  toggleTherapy(therapy: Therapy): void {
    const index = this.selectedTherapies.indexOf(therapy);
    if (index >= 0) {
      this.selectedTherapies.splice(index, 1);
    } else {
      this.selectedTherapies.push(therapy);
    }
    this.form.patchValue({ therapies: this.selectedTherapies });
  }

  removeTherapy(therapy: Therapy): void {
    this.toggleTherapy(therapy);
  }

  removeSession(session: string): void {
    this.toggleSession(session );
  }

  toggleSession(session: string): void {
    const index = this.selectedSessions.indexOf(session);
    if (index >= 0) {
      this.selectedSessions.splice(index, 1);
    } else {
      this.selectedSessions.push(session);
    }
    this.form.patchValue({ sessions: this.selectedSessions });
  }

  isSessionSelected(session: string): boolean {
    return this.selectedSessions.includes(session);
  }

  isTherapySelected(therapy: Therapy): boolean {
    return this.selectedTherapies.includes(therapy);
  }
  getAllTherapies(): any {
    this.therapyService.getAll().subscribe({
      next: (therapy: Therapy[]) => { this.availableTherapies = therapy; },
      error: (err) => { console.error('Error loading therapies', err); this.notification.showError('Erro ao carregar terapias: ' + (err?.message || err)); }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid && this.selectedTherapies.length > 0) {
      const formValue = this.form.value;
      formValue.therapies = this.selectedTherapies;
      formValue.sessionsId = this.selectedSessions;
      this.dialogRef.close(formValue);
    }
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
      return controlName === 'cpf' ? 'CPF deve conter 11 dígitos' : 'Formato inválido';
    }
    return '';
  }
  organizeTable() {
    const grouped: { [key: string]: string[] } = {};

    this.sessionsList.forEach(session => {
      const day = session.substring(0, 3).toUpperCase();
      if (!grouped[day]) {
        grouped[day] = [];
        this.days.push(day);
      }
      grouped[day].push(session);
    });

    const maxRows = Math.max(...Object.values(grouped).map(sessions => sessions.length));

    this.sessionRows = [];
    for (let i = 0; i < maxRows; i++) {
      const row = this.days.map(day => grouped[day][i] || null);
      this.sessionRows.push(row);
    }
  }
  extractHour(sessionId: string): string {
    return sessionId.substring(4,8).replace(/(\d{2})(\d{2})/, "$1:$2");
  }
}