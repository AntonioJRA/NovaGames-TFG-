import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, of, throwError } from 'rxjs';
import {
  Game,
  GameCategories,
  GameRating,
  GameResponse,
} from '../models/game/game';
import { environment } from '../../environments/environment';
import { Category } from '../models/category/category';
import { GameUpdate } from '../models/updateGame/updateGame';

@Injectable({
  providedIn: 'root',
})
export class UploadImageService {
  public http = inject(HttpClient);

  postImageToServer(token: string, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<any>(
        `${environment.apiUrl}/upload-image`,
        formData,
        { headers }
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
