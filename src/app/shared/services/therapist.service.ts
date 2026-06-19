import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Therapist } from '../data/therapist.interface';
import { getApiUrl, getApiUrlWithFilter, getApiUrlWithPath } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class TherapistService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('therapists'); // Parameterized remote API URL
  private apiUrlCreate = getApiUrl('therapistsCreate'); // Parameterized remote API URL
  
  private therapistsCache$ = new BehaviorSubject<Therapist[]>([]);
  therapists$ = this.therapistsCache$.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllTherapists();
  }

  /**
   * Load all therapists from API
   */
  private loadAllTherapists(): void {
    this.loadingSubject.next(true);
    this.http.get<Therapist[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.therapistsCache$.next(data.map((therapist: Therapist) => ({
            ...therapist,
            therapies: therapist.therapies || [], // Garantir que therapies seja um array
                                                       
            sessions: therapist.sessionsId ? therapist.sessionsId : []
          })) );
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading therapists:', error);
          this.notification.showError('Erro ao carregar terapeutas: ' + (error?.message || error));
          this.errorSubject.next('Error loading therapists from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get all therapists
   */
  getAll(): Observable<Therapist[]> {
    return this.therapistsCache$.asObservable();
  }

  /**
   * Get therapist by ID
   */
  getById(id: string): Observable<Therapist | undefined> {
    return this.http.get<Therapist>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching therapist ${id}:`, error);
          this.notification.showError('Erro ao buscar terapeuta: ' + (error?.message || error));
          this.errorSubject.next(`Error fetching therapist: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new therapist
   */
  create(therapist: Therapist): Observable<Therapist> {
    this.loadingSubject.next(true);
    return this.http.post<Therapist>(this.apiUrlCreate, therapist)
      .pipe(
        tap(newTherapist => {
          const currentTherapists = this.therapistsCache$.value;
          this.therapistsCache$.next([...currentTherapists, newTherapist]);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error creating therapist:', error);
          this.notification.showError('Erro ao criar terapeuta: ' + (error?.message || error));
          this.errorSubject.next(`Error creating therapist: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update therapist
   */
  update(id: string, therapist: Partial<Therapist>): Observable<Therapist> {
    this.loadingSubject.next(true);
    return this.http.put<Therapist>(`${this.apiUrl}/${id}`, therapist)
      .pipe(
        tap(updatedTherapist => {
          const currentTherapists = this.therapistsCache$.value;
          const index = currentTherapists.findIndex(t => t.id === id);
          if (index !== -1) {
            currentTherapists[index] = updatedTherapist;
            this.therapistsCache$.next([...currentTherapists]);
          }
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error updating therapist ${id}:`, error);
          this.notification.showError('Erro ao atualizar terapeuta: ' + (error?.message || error));
          this.errorSubject.next(`Error updating therapist: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete therapist
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentTherapists = this.therapistsCache$.value;
          this.therapistsCache$.next(currentTherapists.filter(t => t.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error deleting therapist ${id}:`, error);
          this.notification.showError('Erro ao excluir terapeuta: ' + (error?.message || error));
          this.errorSubject.next(`Error deleting therapist: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get active therapists
   */
  getActive(): Observable<Therapist[]> {
    return this.http.get<Therapist[]>(getApiUrlWithFilter('therapists', 'status'))
      .pipe(
        catchError(error => {
          console.error('Error fetching active therapists:', error);
          this.notification.showError('Erro ao buscar terapeutas ativos: ' + (error?.message || error));
          this.errorSubject.next('Error fetching active therapists');
          return of([]);
        })
      );
  }

  /**
   * Add therapy to therapist
   */
  addTherapy(therapistId: string, therapyId: string): Observable<Therapist> {
    return this.http.post<Therapist>(getApiUrlWithPath('therapists', `/${therapistId}/therapies`), { therapyId })
      .pipe(
        tap(updatedTherapist => {
          const currentTherapists = this.therapistsCache$.value;
          const index = currentTherapists.findIndex(t => t.id === therapistId);
          if (index !== -1) {
            currentTherapists[index] = updatedTherapist;
            this.therapistsCache$.next([...currentTherapists]);
          }
          this.errorSubject.next(null);
        }),
        catchError(error => {
          console.error('Error adding therapy to therapist:', error);
          this.notification.showError('Erro ao adicionar terapia ao terapeuta: ' + (error?.message || error));
          this.errorSubject.next('Error adding therapy to therapist');
          return throwError(() => error);
        })
      );
  }

  /**
   * Remove therapy from therapist
   */
  removeTherapy(therapistId: string, therapyId: string): Observable<Therapist> {
    return this.http.delete<Therapist>(getApiUrlWithPath('therapists', `/${therapistId}/therapies/${therapyId}`))
      .pipe(
        tap(updatedTherapist => {
          const currentTherapists = this.therapistsCache$.value;
          const index = currentTherapists.findIndex(t => t.id === therapistId);
          if (index !== -1) {
            currentTherapists[index] = updatedTherapist;
            this.therapistsCache$.next([...currentTherapists]);
          }
          this.errorSubject.next(null);
        }),
        catchError(error => {
          console.error('Error removing therapy from therapist:', error);
          this.notification.showError('Erro ao remover terapia do terapeuta: ' + (error?.message || error));
          this.errorSubject.next('Error removing therapy from therapist');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get therapists by therapy
   */
  getTherapistsByTherapy(therapyId: string): Observable<Therapist[]> {
    return this.http.get<Therapist[]>(getApiUrlWithPath('therapists', `/therapy/${therapyId}`))
      .pipe(
        catchError(error => {
          console.error(`Error fetching therapists by therapy ${therapyId}:`, error);
          this.notification.showError('Erro ao buscar terapeutas por terapia: ' + (error?.message || error));
          this.errorSubject.next('Error fetching therapists');
          return of([]);
        })
      );
  }

  /**
   * Refresh therapists cache manually
   */
  refreshTherapists(): void {
    this.loadAllTherapists();
  }

  /**
   * Limpar mensagem de erro
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}