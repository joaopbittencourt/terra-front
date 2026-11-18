import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { getApiUrl, getApiUrlWithPath } from '../config/api.config';
import { Contract } from '../data/contract.interface';
import { Modality } from '../data/modality.interface';
import { NotificationService } from '../../services/notification/notification';
import { PaymentDTO } from '../data/payment.dto.interface';
import { MovementOutput } from '../data/movement-output.model';

@Injectable({ providedIn: 'root' })
export class MakePaymentService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl("payment");
  
  constructor(private http: HttpClient) {}

  registerPaymentTeam(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/team`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment team', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentBusinesspartner(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/businesspartner`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment businesspartner', err);
        return throwError(() => err);
      })
    );
  }
  
  registerPaymentLoan(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/loan`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment loan', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentCredit(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/credit`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment credit', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentLegaldepartment(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/legaldepartment`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment legaldepartment', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentEducation(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/education`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment education', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentWather(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/wather`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment wather', err);
        return throwError(() => err);
      })
    );
  }
  registerPaymentEnergy(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/energy`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment energy', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentContability(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/contability`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment contability', err);
        return throwError(() => err);
      })
    );
  }

  registerPaymentWithdrawal(payload: PaymentDTO): Observable<MovementOutput> {
    return this.http.post<MovementOutput>(`${this.apiUrl}/withdrawal`, payload).pipe(
      catchError(err => {
        console.error('Error registering payment withdrawal', err);
        return throwError(() => err);
      })
    );
  }
}
