import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  public http = inject(HttpClient);

  getUser(token: string): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http
      .get<User>(`${environment.apiUrl}${environment.routes.getUser}`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${environment.apiUrl}${environment.routes.profile.getAllUsers}`)
      .pipe(catchError(this.handleError));
  }

  updateProfile(token: string, profile_image: string): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http
      .patch<User>(`${environment.apiUrl}${environment.routes.profile.updateProfile}`, { profile_image }, { headers })
      .pipe(catchError(this.handleError));
  }

  temporalyBanUser(token: string, id: number, email: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http
      .patch<void>(`${environment.apiUrl}${environment.routes.profile.temporalyBanUser}/${id}`, { email }, { headers })
      .pipe(catchError(this.handleError));
  }

  temporalyUnbanUser(token: string, id: number, email: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http
      .patch<void>(`${environment.apiUrl}${environment.routes.profile.temporalyUnbanUser}/${id}`, { email }, { headers })
      .pipe(catchError(this.handleError));
  }

  permanentlyBanUser(token: string, id: number, email: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http
      .patch<void>(`${environment.apiUrl}${environment.routes.profile.permanentlyBanUser}/${id}`, { email }, { headers })
      .pipe(catchError(this.handleError));
  }

  permanentlyUnbanUser(token: string, id: number, email: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http
      .patch<void>(`${environment.apiUrl}${environment.routes.profile.permanentlyUnbanUser}/${id}`, { email }, { headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage: string = '';

    if (err.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${err.error.message}`;
    } else if (err.error && err.error.message) {
      errorMessage = err.error.message; // <- mensaje personalizado del backend
    } else {
      errorMessage = `Error del servidor: ${err.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
