import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { getApiUrl, getApiUrlWithPath } from '../config/api.config';
import { Contract } from '../data/contract.interface';
import { Modality } from '../data/modality.interface';
import { NotificationService } from '../../services/notification/notification';
import { DepositDTO } from '../data/deposit.dto.interface';
import { MovementInput } from '../data/movement-input.model';

@Injectable({ providedIn: 'root' })
export class ReceiveDepositService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('deposit');

   private contractsCache$ = new BehaviorSubject<Contract[]>([]);
    patients$ = this.contractsCache$.asObservable();
    
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    
    private errorSubject = new BehaviorSubject<string | null>(null);
    error$ = this.errorSubject.asObservable();


  constructor(private http: HttpClient) {}

    registerMovimentInputOfHealthinsurance(payload: DepositDTO): Observable<MovementInput> {
      return this.http.post<MovementInput>(`${this.apiUrl}/healthinsurance`, payload).pipe(
        catchError(err => {
          console.error('Error registering deposit for health insurance', err);
          return throwError(() => err);
        })
      );
    }

    registerMovimentInputOfAport(payload: DepositDTO): Observable<MovementInput> {
      return this.http.post<MovementInput>(`${this.apiUrl}/aport`, payload).pipe(
        catchError(err => {
          console.error('Error registering deposit for aport', err);
          return throwError(() => err);
        })
      );
    }

    registerMovimentInputOf(payload: DepositDTO): Observable<MovementInput> {
      return this.http.post<MovementInput>(`${this.apiUrl}/particular`, payload).pipe(
        catchError(err => {
          console.error('Error registering deposit for particular', err);
          return throwError(() => err);
        })
      );
    }

    registerMovimentInputOfLoan(payload: DepositDTO): Observable<MovementInput> {
      return this.http.post<MovementInput>(`${this.apiUrl}/loan`, payload).pipe(
        catchError(err => {
          console.error('Error registering deposit for loan', err);
          return throwError(() => err);
        })
      );
    }

}
