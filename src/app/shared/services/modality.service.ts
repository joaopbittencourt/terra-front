import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Modality } from '../data/modality.interface';
import { getApiUrl, getApiUrlWithFilter } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class ModalityService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('modalities'); // Parameterized remote API URL
  private apiSaveUrl = getApiUrl('modalitiesCreate'); // URL to create modality

  private modalitiesCache$ = new BehaviorSubject<Modality[]>([]);
  modalities$ = this.modalitiesCache$.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllModalities();
  }

  /**
   * Load all modalities from API
   */
  private loadAllModalities(): void {
    this.loadingSubject.next(true);
    this.http.get<Modality[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.modalitiesCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao buscar modalidades: ' + (error?.message || error));
          console.error('Error loading modalities:', error);
          this.errorSubject.next('Error loading modalities from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get all modalities
   */
  getAll(): Observable<Modality[]> {
    return this.modalitiesCache$.asObservable();
  }

  /**
   * Get modality by ID
   */
  getById(id: string): Observable<Modality | undefined> {
    return this.http.get<Modality>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching modality ${id}:`, error);
          this.notification.showError('Erro ao buscar modalidade: ' + (error?.message || error));
          this.errorSubject.next(`Error fetching modality: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new modality
   */
  create(modality: Modality): Observable<Modality> {
    this.loadingSubject.next(true);
    return this.http.post<Modality>(this.apiSaveUrl, modality)
      .pipe(
        tap(newModality => {
          const currentModalities = this.modalitiesCache$.value;
          this.modalitiesCache$.next([...currentModalities, newModality]);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error creating modality:', error);
          this.notification.showError('Erro ao criar modalidade: ' + (error?.message || error));
          this.errorSubject.next(`Error creating modality: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update modality
   */
  update(id: string, modality: Partial<Modality>): Observable<Modality> {
    this.loadingSubject.next(true);
    return this.http.put<Modality>(`${this.apiUrl}/${id}`, modality)
      .pipe(
        tap(updatedModality => {
          const currentModalities = this.modalitiesCache$.value;
          const index = currentModalities.findIndex(m => m.id === id);
          if (index !== -1) {
            currentModalities[index] = updatedModality;
            this.modalitiesCache$.next([...currentModalities]);
          }
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao atualizar modalidade: ' + (error?.message || error));
          console.error(`Error updating modality ${id}:`, error);
          this.errorSubject.next(`Error updating modality: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete modality
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentModalities = this.modalitiesCache$.value;
          this.modalitiesCache$.next(currentModalities.filter(m => m.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao deletar modalidade: ' + (error?.message || error));
          console.error(`Error deleting modality ${id}:`, error);
          this.errorSubject.next(`Error deleting modality: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get active modalities
   */
  getActive(): Observable<Modality[]> {
    return this.http.get<Modality[]>(getApiUrlWithFilter('modalities', 'status'))
      .pipe(
        catchError(error => {
          this.notification.showError('Erro ao buscar modalidades ativas: ' + (error?.message || error));
          console.error('Error fetching active modalities:', error);
          this.errorSubject.next('Error fetching active modalities');
          return of([]);
        })
      );
  }

  /**
   * Refresh modalities cache manually
   */
  refreshModalities(): void {
    this.loadAllModalities();
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}