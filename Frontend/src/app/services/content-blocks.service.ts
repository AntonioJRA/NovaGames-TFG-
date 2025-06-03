import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContentBlock } from '../models/content_block/content_block';

@Injectable({
  providedIn: 'root',
})
export class ContentBlocksService {
  public http = inject(HttpClient);

  getContentBlocks(id: string | number): Observable<ContentBlock[]> {
    return this.http
      .get<ContentBlock[]>(
        `${environment.apiUrl}${environment.routes.games.getContentBlocks}/${id}`
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
