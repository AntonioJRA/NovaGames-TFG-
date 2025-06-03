import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, throwError } from 'rxjs';
import { Game, GameResponse } from '../models/game/game';
import { environment } from '../../environments/environment';
import { Post } from '../models/post/post';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  public http = inject(HttpClient);

  getAllPosts(id: string): Observable<Post[]> {
    return this.http
      .get<Post[]>(
        `${environment.apiUrl}${environment.routes.gameSection.getAllPosts}/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  getPost(id: string): Observable<Post> {
    return this.http
      .get<Post>(
        `${environment.apiUrl}${environment.routes.posts.getPost}/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage: string = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente ${err.error.message}`;
    } else {
      errorMessage = `Error del servidor ${err.error.message}`;
    }
    return throwError(() => {
      new Error(errorMessage);
    });
  }
}
