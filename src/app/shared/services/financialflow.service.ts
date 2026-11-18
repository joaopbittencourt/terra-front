import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Guardian } from '../data/responsavel.interface';
import { getApiUrl, getApiUrlWithFilter, getApiUrlWithFilterThowValue } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';
import { FinancialFlow } from '../data/financialflow.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialFlowService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('financialflow');

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Busca um financial flow pelo CPF (retorna null se não encontrado)
   */
  getMovement(dateIn: Date, dateFin: Date): Observable<FinancialFlow | null> {
    if (!dateIn || !dateFin) return of(null);
    return this.http.get<FinancialFlow>(getApiUrlWithFilterThowValue('financialflow', dateIn.toISOString(), dateFin.toISOString())).pipe(
      catchError(error => {
        console.error(`Error fetching financial flow:`, error);
        this.notification.showError('Erro ao buscar fluxo financeiro: ' + (error?.message || error));
        this.errorSubject.next('Financial flow not found');
        return of(null);
      })
    );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}
