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

  getUser(token:string): Observable<User> {
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
