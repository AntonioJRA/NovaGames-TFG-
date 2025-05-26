import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category/category';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  public http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(
        `${environment.apiUrl}${environment.routes.games.getCategories}`
      )
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
