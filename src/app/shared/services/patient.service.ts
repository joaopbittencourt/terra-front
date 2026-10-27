import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { PatientModel } from '../data/patient.model';
import { getApiUrl, getApiUrlWithFilter } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('patients'); // Parameterized remote API URL
  private apiUrlByTerapist = getApiUrl('patientsByTerapist'); // Parameterized remote API URL for patients by therapist
  private apiUrlCreate = getApiUrl('patientsCreate'); // URL for creating patients
  private patientsCache$ = new BehaviorSubject<PatientModel[]>([]);
  patients$ = this.patientsCache$.asObservable();
  
  private patientsByTerapistCache$ = new BehaviorSubject<PatientModel[]>([]);
  patientsByTerapist$ = this.patientsByTerapistCache$.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllPatients();
    this.loadAllPatientsByTherapist();
  }

  /**
   * Load all patients from API
   */
  private loadAllPatients(): void {
    this.loadingSubject.next(true);
    this.http.get<PatientModel[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.patientsCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading patients:', error);
          this.notification.showError('Erro ao carregar pacientes: ' + (error?.message || error));
          this.errorSubject.next('Error loading patients from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

    private loadAllPatientsByTherapist(): void {
    this.loadingSubject.next(true);
    this.http.get<PatientModel[]>(this.apiUrlByTerapist)
      .pipe(
        tap(data => {
          this.patientsByTerapistCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading patients:', error);
          this.notification.showError('Erro ao carregar pacientes: ' + (error?.message || error));
          this.errorSubject.next('Error loading patients from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get all patients
   */
  getAll(): Observable<PatientModel[]> {
    return this.patientsCache$.asObservable();
  }

   /**
   * Get all patients
   */
  getAllByTerapist(): Observable<PatientModel[]> {
    return this.patientsByTerapistCache$.asObservable();
  }

  /**
   * Get patient by ID
   */
  getById(id: string): Observable<PatientModel> {
    return this.http.get<PatientModel>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching patient ${id}:`, error);
          this.errorSubject.next(`Error fetching patient: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new patient
   */
  create(patient: PatientModel): Observable<PatientModel> {
    this.loadingSubject.next(true);
    return this.http.post<PatientModel>(this.apiUrlCreate, patient)
      .pipe(
        tap(newPatient => {
          const currentPatients = this.patientsCache$.value;
          const nextPatients = [...currentPatients];
          const index = nextPatients.findIndex(p => String(p.id) === String(newPatient.id));

          if (index !== -1) {
            nextPatients[index] = { ...nextPatients[index], ...newPatient } as PatientModel;
          } else {
            nextPatients.push(newPatient);
          }

          this.patientsCache$.next(nextPatients);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error creating patient:', error);
          this.notification.showError('Erro ao criar paciente: ' + (error?.message || error));
          this.errorSubject.next(`Error creating patient: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update patient
   */
  update(id: string, patient: Partial<PatientModel>): Observable<PatientModel> {
    this.loadingSubject.next(true);
    return this.http.post<PatientModel>(`${this.apiUrl}/${id}`, patient)
      .pipe(
        tap(updatedPatient => {
          const currentPatients = this.patientsCache$.value;
          const nextPatients = [...currentPatients];
          const index = nextPatients.findIndex(p => String(p.id) === String(id || updatedPatient.id));

          if (index !== -1) {
            nextPatients[index] = { ...nextPatients[index], ...updatedPatient } as PatientModel;
          } else {
            nextPatients.push(updatedPatient);
          }

          this.patientsCache$.next(nextPatients);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao atualizar paciente: ' + (error?.message || error));
          console.error(`Error updating patient ${id}:`, error);
          this.errorSubject.next(`Error updating patient: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete patient
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentPatients = this.patientsCache$.value;
          this.patientsCache$.next(currentPatients.filter(p => p.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error deleting patient ${id}:`, error);
          this.notification.showError('Erro ao excluir paciente: ' + (error?.message || error));
          this.errorSubject.next(`Error deleting patient: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get active patients
   */
  getActive(): Observable<PatientModel[]> {
    return this.http.get<PatientModel[]>(getApiUrlWithFilter('patients', 'status'))
      .pipe(
        catchError(error => {
          console.error('Error fetching active patients:', error);
          this.notification.showError('Erro ao carregar pacientes ativos: ' + (error?.message || error));
          this.errorSubject.next('Error fetching active patients');
          return of([]);
        })
      );
  }

  /**
   * Get patient by document
   */
  getByDocument(document: string): Observable<PatientModel | null> {
    return this.http.get<PatientModel>(getApiUrlWithFilter('patients', 'document', document))
      .pipe(
        catchError(error => {
          console.error(`Error fetching patient by document ${document}:`, error);
          this.notification.showError('Erro ao buscar paciente por documento: ' + (error?.message || error));
          this.errorSubject.next('Patient not found');
          return of(null);
        })
      );
  }

  /**
   * Get patients by agreement
   */
  getByAgreement(agreement: string): Observable<PatientModel[]> {
    return this.http.get<PatientModel[]>(getApiUrlWithFilter('patients', 'agreement', agreement))
      .pipe(
        catchError(error => {
          console.error(`Error fetching patients by agreement ${agreement}:`, error);
          this.notification.showError('Erro ao buscar pacientes por convênio: ' + (error?.message || error));
          this.errorSubject.next('Error fetching patients by agreement');
          return of([]);
        })
      );
  }

  /**
   * Refresh patient cache manually
   */
  refreshPatients(): void {
    this.loadAllPatients();
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}