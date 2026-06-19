import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { healthInsurance } from '../data/health-plan.interface';
import { getApiUrlWithPath } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({ providedIn: 'root' })
export class HealthPlanService {
  private notification = inject(NotificationService);
  private readonly apiUrl = getApiUrlWithPath('healthPlans');
  private readonly apiUrlCreate = getApiUrlWithPath('healthPlansCreate');
  private _healthPlans$ = new BehaviorSubject<healthInsurance[]>([]);
  public readonly healthPlans$ = this._healthPlans$.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<healthInsurance[]> {
    return this.http.get<healthInsurance[]>(this.apiUrl).pipe(
      tap(healthPlans => this._healthPlans$.next(healthPlans)),
    
      catchError((error) => {
        this.notification.showError('Erro ao buscar planos de saúde: ' + (error?.message || error));
        return [];
      })
    );
  }

  add(healthPlan: healthInsurance): Observable<healthInsurance> {
    return this.http.post<healthInsurance>(this.apiUrlCreate, healthPlan).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  update(healthPlan: healthInsurance): Observable<healthInsurance> {
    return this.http.put<healthInsurance>(`${this.apiUrlCreate}/${healthPlan.id}`, healthPlan).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getAll().subscribe())
    );
  }
}
