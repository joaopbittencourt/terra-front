import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Schedule } from '../data/schedule.interface';
import { getApiUrl } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';
import { ScheduleDTO } from '../data/schedule-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('schedules'); // Parameterized remote API URL
  private apiUrlActive = getApiUrl('schedulesActive');
  private apiUrlCreate = getApiUrl('scheduleCreate'); // Parameterized remote API URL for create/update

  private schedulesCache$ = new BehaviorSubject<Schedule[]>([]);
  schedules$ = this.schedulesCache$.asObservable();

  private schedulesDTOCache$ = new BehaviorSubject<ScheduleDTO[]>([]);
  schedulesDTO$ = this.schedulesDTOCache$.asObservable();


  private schedulesActiveCache$ = new BehaviorSubject<Schedule[]>([]);
  schedulesActive$ = this.schedulesActiveCache$.asObservable();


  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    //this.loadAllSchedules();
    this.loadActiveSchedules();
  }

  /**
   * Load all schedules from API
   */
  private loadAllSchedules(): void {
    this.loadingSubject.next(true);
    this.http.get<Schedule[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.schedulesCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao buscar agendamentos: ' + (error?.message || error));
          console.error('Error loading schedules:', error);
          this.errorSubject.next('Error loading schedules from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  private loadActiveSchedules(): void {
    this.loadingSubject.next(true);
    this.http.get<Schedule[]>(this.apiUrlActive)
      .pipe(
        tap(data => {
          this.schedulesActiveCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading schedules:', error);
          this.notification.showError('Erro ao buscar agendamentos: ' + (error?.message || error));
          this.errorSubject.next('Error loading schedules from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  getAllByContract(contractId: string): Observable<any> {
    this.loadingSubject.next(true);
    return this.http.get<Schedule[]>(`${this.apiUrl}/contract/${contractId}`)
      .pipe(
        tap(data => {
          this.schedulesCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading schedules:', error);
          this.notification.showError('Erro ao buscar agendamentos: ' + (error?.message || error));
          this.errorSubject.next('Error loading schedules from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      );
  }

  getAllByContractPeerTherapist(contractId: string): Observable<any> {
    this.loadingSubject.next(true);
    return this.http.get<ScheduleDTO[]>(`${this.apiUrl}/contract/${contractId}/peer-therapist`)
      .pipe(
        tap(data => {
          this.schedulesDTOCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error loading schedules:', error);
          this.notification.showError('Erro ao buscar agendamentos por terapeuta: ' + (error?.message || error));
          this.errorSubject.next('Error loading schedules from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      );
  }


  /**
   * Get all schedules
   */
  getAll(): Observable<Schedule[]> {
    return this.schedulesCache$.asObservable();
  }

  /**
   * Get all schedules
   */
  getActiveSchedules(): Observable<Schedule[]> {
    return this.schedulesActiveCache$.asObservable();
  }

  /**
   * Get schedule by ID
   */
  getById(id: string): Observable<Schedule | undefined> {
    return this.http.get<Schedule>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching schedule ${id}:`, error);
          this.notification.showError('Erro ao buscar agendamento: ' + (error?.message || error)); 
          this.errorSubject.next(`Error fetching schedule: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get schedules by date range
   */
  getByDateRange(startDate: Date | string, endDate: Date | string): Observable<Schedule[]> {
    const schedules = this.schedulesCache$.value;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= start && scheduleDate <= end;
    });

    return of(filtered);
  }

  /**
   * Create new schedule
   */
  create(schedule: Schedule): Observable<Schedule> {
    this.loadingSubject.next(true);
    return this.http.post<Schedule>(this.apiUrlCreate, schedule)
      .pipe(
        tap(newSchedule => {
          const currentSchedules = this.schedulesCache$.value;
          this.schedulesCache$.next([...currentSchedules, newSchedule]);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Error creating schedule:', error);
          this.notification.showError('Erro ao criar agendamento: ' + (error?.message || error));
          this.errorSubject.next(`Error creating schedule: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  setRegisterAppointment( contractId: string, payload: any): Observable<unknown> {
    return this.http.post(`${this.apiUrlCreate}/${contractId}`, payload).pipe(
      catchError(err => {
        console.error('Error registering appointment', err);
        this.notification.showError('Erro ao registrar consulta: ' + (err?.message || err));
        return throwError(() => err);
      })
     );
  }

  /**
   * Register a session (prontuário) for a schedule
   * Payload expected by backend: { sscheduleId, description }
   */
  registerSession(sscheduleId: string, description: string, date?: string): Observable<unknown> {
    const payload: any = { sscheduleId, description };
    if (date) {
      payload.date = date;
    }
    const url = getApiUrl('registerSession');
    this.loadingSubject.next(true);
    return this.http.post(url, payload).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.loadingSubject.next(false);
      }),
      catchError(err => {
        this.notification.showError('Erro ao registrar sessão: ' + (err?.message || err));
        console.error('Error registering session:', err);
        this.errorSubject.next('Error registering session');
        this.loadingSubject.next(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Update schedule
   */
  update(id: string, schedule: Partial<Schedule>): Observable<Schedule> {
    this.loadingSubject.next(true);
    return this.http.put<Schedule>(`${this.apiUrlCreate}/${id}`, schedule)
      .pipe(
        tap(updatedSchedule => {
          const currentSchedules = this.schedulesCache$.value;
          const index = currentSchedules.findIndex(s => s.id === id);
          if (index > -1) {
            currentSchedules[index] = updatedSchedule;
            this.schedulesCache$.next([...currentSchedules]);
          }
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao atualizar agendamento: ' + (error?.message || error));
          console.error(`Error updating schedule ${id}:`, error);
          this.errorSubject.next(`Error updating schedule: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete schedule
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentSchedules = this.schedulesCache$.value;
          this.schedulesCache$.next(currentSchedules.filter(s => s.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao deletar agendamento: ' + (error?.message || error));
          console.error(`Error deleting schedule ${id}:`, error);
          this.errorSubject.next(`Error deleting schedule: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh schedules from API
   */
  refresh(): void {
    this.loadActiveSchedules();
  }
}
