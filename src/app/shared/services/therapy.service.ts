import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Therapy, TherapyValue } from '../data/therapy.interface';
import { getApiUrl, getApiUrlWithFilter, getApiUrlWithPath } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class TherapyService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('therapies'); // Parameterized remote API URL
  private apiUrlCreate = getApiUrl('therapiesCreate'); // Parameterized remote API URL
  private therapiesCache$ = new BehaviorSubject<Therapy[]>([]);
  therapies$ = this.therapiesCache$.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllTherapies();
  }

  /**
   * Load all therapies from API
   */
  private loadAllTherapies(): void {
    this.loadingSubject.next(true);
    this.http.get<Therapy[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.therapiesCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading therapies:', error);
          this.notification.showError('Erro ao carregar terapias: ' + (error?.message || error));
          this.errorSubject.next('Error loading therapies from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get all therapies
   */
  getAll(): Observable<Therapy[]> {
    return this.therapiesCache$.asObservable();
  }

  /**
   * Get therapy by ID
   */
  getById(id: string): Observable<Therapy | undefined> {
    return this.http.get<Therapy>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching therapy ${id}:`, error);
          this.notification.showError('Erro ao buscar terapia: ' + (error?.message || error));
          this.errorSubject.next(`Error fetching therapy: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new therapy
   */
  create(therapy: Therapy): Observable<Therapy> {
    this.loadingSubject.next(true);
    return this.http.post<Therapy>(this.apiUrlCreate, therapy)
      .pipe(
        tap(newTherapy => {
          const currentTherapies = this.therapiesCache$.value;
          const nextTherapies = [...currentTherapies];
          const index = nextTherapies.findIndex(t => String(t.id) === String(newTherapy.id));

          if (index !== -1) {
            nextTherapies[index] = { ...nextTherapies[index], ...newTherapy };
          } else {
            nextTherapies.push(newTherapy);
          }

          this.therapiesCache$.next(nextTherapies);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error creating therapy:', error);
          this.notification.showError('Erro ao criar terapia: ' + (error?.message || error));
          this.errorSubject.next(`Error creating therapy: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update therapy
   */
  update(id: string, therapy: Partial<Therapy>): Observable<Therapy> {
    this.loadingSubject.next(true);
    return this.http.put<Therapy>(`${this.apiUrlCreate}/${id}`, therapy)
      .pipe(
        tap(updatedTherapy => {
          const currentTherapies = this.therapiesCache$.value;
          const nextTherapies = [...currentTherapies];
          const index = nextTherapies.findIndex(t => String(t.id) === String(id || updatedTherapy.id));

          if (index !== -1) {
            nextTherapies[index] = { ...nextTherapies[index], ...updatedTherapy };
          } else {
            nextTherapies.push(updatedTherapy);
          }

          this.therapiesCache$.next(nextTherapies);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error updating therapy ${id}:`, error);
          this.notification.showError('Erro ao atualizar terapia: ' + (error?.message || error));
          this.errorSubject.next(`Error updating therapy: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete therapy
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentTherapies = this.therapiesCache$.value;
          this.therapiesCache$.next(currentTherapies.filter(t => t.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error deleting therapy ${id}:`, error);
          this.notification.showError('Erro ao excluir terapia: ' + (error?.message || error));
          this.errorSubject.next(`Error deleting therapy: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get active therapies
   */
  getActive(): Observable<Therapy[]> {
    return this.http.get<Therapy[]>(getApiUrlWithFilter('therapies', 'status'))
      .pipe(
        catchError(error => {
          console.error('Error fetching active therapies:', error);
          this.notification.showError('Erro ao buscar terapias ativas: ' + (error?.message || error));
          this.errorSubject.next('Error fetching active therapies');
          return of([]);
        })
      );
  }

  /**
   * Add value (modality + price) to a therapy
   */
  addValue(therapyId: string, value: TherapyValue): Observable<Therapy | null> {
    return this.http.post<Therapy>(getApiUrlWithPath('therapies', `/${therapyId}/values`), value)
      .pipe(
        tap(updatedTherapy => {
          const currentTherapies = this.therapiesCache$.value;
          const index = currentTherapies.findIndex(t => t.id === therapyId);
          if (index !== -1) {
            currentTherapies[index] = updatedTherapy;
            this.therapiesCache$.next([...currentTherapies]);
          }
          this.errorSubject.next(null);
        }),
        catchError(error => {
          console.error('Error adding value to therapy:', error);
          this.notification.showError('Erro ao adicionar valor à terapia: ' + (error?.message || error));
          this.errorSubject.next('Error adding value to therapy');
          return of(null);
        })
      );
  }

  /**
   * Remove value (modality) from a therapy
   */
  removeValue(therapyId: string, modality: string): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(getApiUrlWithPath('therapies', `/${therapyId}/values/${modality}`))
      .pipe(
        tap(() => {
          const currentTherapies = this.therapiesCache$.value;
          const index = currentTherapies.findIndex(t => t.id === therapyId);
          if (index !== -1) {
            const therapy = currentTherapies[index];
            if (therapy.values) {
              therapy.values = therapy.values.filter(v => v.modality !== modality);
              this.therapiesCache$.next([...currentTherapies]);
            }
          }
          this.errorSubject.next(null);
        }),
        map(() => true),
        catchError(error => {
          console.error('Error removing value from therapy:', error);
          this.notification.showError('Erro ao remover valor da terapia: ' + (error?.message || error));
          this.errorSubject.next('Error removing value from therapy');
          return of(false);
        })
      );
  }

  /**
   * Get value of a therapy for a specific modality
   */
  getValue(therapyId: string, modality: string): Observable<number | null> {
    return this.http.get<{ price: number }>(getApiUrlWithPath('therapies', `/${therapyId}/values/${modality}`))
      .pipe(
        map(response => response.price),
        catchError(error => {
          console.error('Error fetching therapy value:', error);
          this.notification.showError('Erro ao buscar valor da terapia: ' + (error?.message || error));
          this.errorSubject.next('Error fetching therapy value');
          return of(null);
        })
      );
  }

  /**
   * Refresh therapies cache manually
   */
  refreshTherapies(): void {
    this.loadAllTherapies();
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}