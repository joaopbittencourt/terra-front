import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Guardian } from '../data/responsavel.interface';
import { getApiUrl, getApiUrlWithFilter } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class GuardiansService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('guardians');
  private apiUrlCreate = getApiUrl('guardiansCreate');

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Busca um guardian pelo CPF (retorna null se não encontrado)
   */
  getByCpf(cpf: string): Observable<Guardian | null> {
    if (!cpf) return of(null);
    return this.http.get<Guardian>(getApiUrlWithFilter('guardians', 'cpf', cpf)).pipe(
      catchError(error => {
        console.error(`Error fetching guardian by cpf ${cpf}:`, error);
        this.notification.showError('Erro ao buscar responsável por CPF: ' + (error?.message || error));
        this.errorSubject.next('Guardian not found');
        return of(null);
      })
    );
  }

  /**
   * Cria um novo guardian
   */
  save(guardian: Guardian): Observable<Guardian> {
    this.loadingSubject.next(true);
    return this.http.post<Guardian>(this.apiUrlCreate, guardian).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error creating guardian:', error);
        this.errorSubject.next(`Error creating guardian: ${error.message}`);
        this.notification.showError('Erro ao criar responsável: ' + (error?.message || error));
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza um guardian existente
   */
  update(id: string, guardian: Partial<Guardian>): Observable<Guardian> {
    this.loadingSubject.next(true);
    return this.http.put<Guardian>(`${this.apiUrl}/${id}`, guardian).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.notification.showError('Erro ao atualizar responsável: ' + (error?.message || error));
        console.error(`Error updating guardian ${id}:`, error);
        this.errorSubject.next(`Error updating guardian: ${error.message}`);
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}
