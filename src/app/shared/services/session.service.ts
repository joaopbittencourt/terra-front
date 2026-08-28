import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Session } from '../data/session.interface';
import { getApiUrl } from '../config/api.config';
import { SessionDTO } from '../data/session-dto.interface';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('sessions');
  private apiUrlCreate = getApiUrl('sessionsCreate');

  private sessionsCache$ = new BehaviorSubject<SessionDTO[]>([]);
  sessions$ = this.sessionsCache$.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    //this.loadAllSessions();
  }

  private loadAllSessions(): void {
    this.loadingSubject.next(true);
    this.http.get<SessionDTO[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.sessionsCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading sessions:', error);
          this.notification.showError('Erro ao carregar sessões: ' + (error?.message || error));
          this.errorSubject.next('Error loading sessions from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  getAll(): Observable<SessionDTO[]> {
    return this.sessionsCache$.asObservable();
  }

  getAllByContract(contractId: string): Observable<SessionDTO[]> {
    this.loadingSubject.next(true);
    return this.http.get<SessionDTO[]>(`${this.apiUrl}/contract/${contractId}`)
      .pipe(
        tap(data => {
          this.sessionsCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading sessions by contract:', error);
          this.notification.showError('Erro ao carregar sessões por contrato: ' + (error?.message || error));
          this.errorSubject.next('Error loading sessions from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      );
  }

  getById(id: string): Observable<SessionDTO> {
    return this.http.get<SessionDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching session ${id}:`, error);
          this.notification.showError('Erro ao buscar sessão: ' + (error?.message || error));
          this.errorSubject.next(`Error fetching session: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  create(session: SessionDTO): Observable<SessionDTO> {
    this.loadingSubject.next(true);
    return this.http.post<SessionDTO>(this.apiUrlCreate, session)
      .pipe(
        tap(newSession => {
          const current = this.sessionsCache$.value;
          this.sessionsCache$.next([...current, newSession]);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error creating session:', error);
          this.notification.showError('Erro ao criar sessão: ' + (error?.message || error));
          this.errorSubject.next(`Error creating session: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  update(id: string, session: Partial<SessionDTO>): Observable<SessionDTO> {
    this.loadingSubject.next(true);
    return this.http.put<SessionDTO>(`${this.apiUrlCreate}/${id}`, session)
      .pipe(
        tap(updated => {
          const current = this.sessionsCache$.value;
          const idx = current.findIndex(s => s.id === id);
          if (idx > -1) {
            current[idx] = updated;
            this.sessionsCache$.next([...current]);
          }
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error updating session ${id}:`, error);
          this.notification.showError('Erro ao atualizar sessão: ' + (error?.message || error));
          this.errorSubject.next(`Error updating session: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const current = this.sessionsCache$.value;
          this.sessionsCache$.next(current.filter(s => s.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error deleting session ${id}:`, error);
          this.notification.showError('Erro ao deletar sessão: ' + (error?.message || error));
          this.errorSubject.next(`Error deleting session: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  refresh(): void {
    this.loadAllSessions();
  }
}
