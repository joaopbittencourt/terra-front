import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Guide } from '../data/guide.interface';
import { getApiUrlWithPath } from '../config/api.config';
import { NotificationService } from '../../services/notification/notification';

@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly apiUrl = getApiUrlWithPath('guides');
  private readonly apiUrlCreate = getApiUrlWithPath('guidesCreate');

  constructor(private http: HttpClient, private notification: NotificationService) {}

  getAll(): Observable<Guide[]> {
    return this.http.get<Guide[]>(this.apiUrl).pipe(
      catchError(error => {
        this.notification.showError('Erro ao buscar guias: ' + (error?.message || error));
        return throwError(() => error);
      })
    );
  }

  create(guide: Guide): Observable<Guide> {
    return this.http.post<Guide>(this.apiUrlCreate, guide);
  }

  update(guide: Guide): Observable<Guide> {
    return this.http.put<Guide>(`${this.apiUrlCreate}/${guide.id}`, guide);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}