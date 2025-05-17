import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public http = inject(HttpClient);

  login(userData: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(`${environment.apiUrl}${environment.routes.login}`, userData, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  register(
    userData: {
      username: string;
      email: string;
      password: string;
    },
    language: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': language,
    });
    return this.http
      .post<any>(
        `${environment.apiUrl}${environment.routes.register}`,
        userData,
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  /*
  obtenerDatos(token: string) {
    const headers = new HttpHeaders({
      'Authorization': Bearer ${token},
      'Content-Type': 'application/json'
    });

    return this.http.get(${this.apiUrl}/datos, { headers });
 }
  */

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
