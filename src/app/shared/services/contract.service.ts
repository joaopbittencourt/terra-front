import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { getApiUrl, getApiUrlWithPath } from '../config/api.config';
import { Contract } from '../data/contract.interface';
import { Modality } from '../data/modality.interface';
import { NotificationService } from '../../services/notification/notification';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('contracts');
  private apiUrlCreate = getApiUrl('contractsCreate');
  private registerAppointmentUrl = getApiUrl('registerAppointment');

   private contractsCache$ = new BehaviorSubject<Contract[]>([]);
    patients$ = this.contractsCache$.asObservable();
    
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    
    private errorSubject = new BehaviorSubject<string | null>(null);
    error$ = this.errorSubject.asObservable();


  constructor(private http: HttpClient) {}

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrlCreate, payload).pipe(
      catchError(err => {
        console.error('Error creating contract', err);
        return throwError(() => err);
      })
    );
  }

  setPlan(id: string, patient: Partial<Contract>): Observable<Contract> {
     this.loadingSubject.next(true);
     return this.http.post<Contract>(`${this.apiUrl}/register-plan/${id}`, patient)
       .pipe(
         tap((updatedContract: Contract) => {
           const currentContracts = this.contractsCache$.value;
           const index = currentContracts.findIndex(p => p.id.toString() === id);
           if (index !== -1) {
             currentContracts[index] = updatedContract;
             this.contractsCache$.next([...currentContracts]);
           }
           this.errorSubject.next(null);
           this.loadingSubject.next(false);
         }),
         catchError(error => {
           console.error(`Error updating contract ${id}:`, error);
           this.notification.showError('Erro ao atualizar contrato: ' + (error?.message || error));
           this.errorSubject.next(`Error updating contract: ${error.message}`);
           this.loadingSubject.next(false);
           return throwError(() => error);
         })
       );
   }

  setModality(id: string, modality: Partial<Modality>): Observable<Contract> {
    console.log('setModality called with id:', id, 'and modality:', modality);
     this.loadingSubject.next(true);
     return this.http.post<Contract>(`${this.apiUrl}/register-modality/${id}`, modality)
       .pipe(
         tap((updatedContract: Contract) => {
           const currentContracts = this.contractsCache$.value;
           const index = currentContracts.findIndex(p => p.id.toString() === id);
           if (index !== -1) {
             currentContracts[index] = updatedContract;
             this.contractsCache$.next([...currentContracts]);
           }
           this.errorSubject.next(null);
           this.loadingSubject.next(false);
         }),
         catchError(error => {
          this.notification.showError('Erro ao atualizar contrato: ' + (error?.message || error));
           console.error(`Error updating contract ${id}:`, error);
           this.errorSubject.next(`Error updating contract: ${error.message}`);
           this.loadingSubject.next(false);
           return throwError(() => error);
         })
       );
   }

   setRegisterAppointment(payload: any): Observable<any> {
    return this.http.post<any>(this.registerAppointmentUrl, payload).pipe(
      catchError(err => {
        console.error('Error registering appointment', err);
        this.notification.showError('Erro ao registrar agendamento: ' + (err?.message || err));
        return throwError(() => err);
      })
    );
  }

  getByPatient(patientId: string): Observable<any> {
    return this.http.get<any>(getApiUrlWithPath('contracts', `/patient/${patientId}`)).pipe(
      catchError(err => {
        console.error('Error fetching contracts for patient', err);
        this.notification.showError('Erro ao buscar contratos para o paciente: ' + (err?.message || err));
        return throwError(() => err);
      })
    );
  }
}
