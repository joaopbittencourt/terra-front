import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ServicePackage } from '../data/service-package.interface';
import { getApiUrl, getApiUrlWithFilter, getApiUrlWithPath } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class ServicePackageService {
  private notification = inject(NotificationService);
  private apiUrl = getApiUrl('servicePackages');
  private apiUrlCreate = getApiUrl('servicePackageCreate');

  private servicePackagesCache$ = new BehaviorSubject<ServicePackage[]>([]);
  servicePackages$ = this.servicePackagesCache$.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllServicePackages();
  }

  /**
   * Load all service packages from API
   */
  private loadAllServicePackages(): void {
    this.loadingSubject.next(true);
    this.http.get<ServicePackage[]>(this.apiUrl)
      .pipe(
        tap(data => {
          this.servicePackagesCache$.next(data);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao carregar pacotes de serviço: ' + (error?.message || error));
          console.error('Error loading service packages:', error);
          this.errorSubject.next('Error loading service packages from API');
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get all service packages
   */
  getAll(): Observable<ServicePackage[]> {
    return this.servicePackagesCache$.asObservable();
  }

  /**
   * Get service package by ID
   */
  getById(id: string): Observable<ServicePackage | undefined> {
    return this.http.get<ServicePackage>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching service package ${id}:`, error);
          this.notification.showError('Erro ao buscar pacote de serviço: ' + (error?.message || error));
          this.errorSubject.next(`Error fetching service package: ${error.message}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new service package
   */
  create(servicePackage: ServicePackage): Observable<ServicePackage> {
    this.loadingSubject.next(true);
    return this.http.post<ServicePackage>(this.apiUrlCreate, servicePackage)
      .pipe(
        tap(newServicePackage => {
          const currentServicePackages = this.servicePackagesCache$.value;
          this.servicePackagesCache$.next([...currentServicePackages, newServicePackage]);
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao criar pacote de serviço: ' + (error?.message || error));
          console.error('Error creating service package:', error);
          this.errorSubject.next(`Error creating service package: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update service package
   */
  update(id: string, servicePackage: Partial<ServicePackage>): Observable<ServicePackage> {
    this.loadingSubject.next(true);
    return this.http.put<ServicePackage>(`${this.apiUrlCreate}/${id}`, servicePackage)
      .pipe(
        tap(updatedServicePackage => {
          const currentServicePackages = this.servicePackagesCache$.value;
          const index = currentServicePackages.findIndex(sp => sp.id === id);
          if (index !== -1) {
            currentServicePackages[index] = updatedServicePackage;
            this.servicePackagesCache$.next([...currentServicePackages]);
          }
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error(`Error updating service package ${id}:`, error);
          this.notification.showError('Erro ao atualizar pacote de serviço: ' + (error?.message || error));
          this.errorSubject.next(`Error updating service package: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete service package
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentServicePackages = this.servicePackagesCache$.value;
          this.servicePackagesCache$.next(currentServicePackages.filter(sp => sp.id !== id));
          this.errorSubject.next(null);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.notification.showError('Erro ao deletar pacote de serviço: ' + (error?.message || error));
          console.error(`Error deleting service package ${id}:`, error);
          this.errorSubject.next(`Error deleting service package: ${error.message}`);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }
}
