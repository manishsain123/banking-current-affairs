import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Bookmark, BookmarkToggleRequest } from '../models/bookmark.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bookmarks`;
  private USER_ID_KEY = 'bankdca_user_id';

  // Reactive set of bookmarked IDs for instantaneous UI toggling
  bookmarkedIds = signal<Set<string>>(new Set());

  constructor() {
    this.ensureUserId();
    this.loadUserBookmarks();
  }

  getUserId(): string {
    return this.ensureUserId();
  }

  private ensureUserId(): string {
    let id = localStorage.getItem(this.USER_ID_KEY);
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(this.USER_ID_KEY, id);
    }
    return id;
  }

  loadUserBookmarks(): void {
    const userId = this.getUserId();
    this.http.get<Bookmark[]>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: (bookmarks) => {
        const idSet = new Set(bookmarks.map(b => b.itemId));
        this.bookmarkedIds.set(idSet);
      },
      error: (err: any) => console.warn('Could not pre-load bookmarks from backend', err)
    });
  }

  getUserBookmarks(): Observable<Bookmark[]> {
    const userId = this.getUserId();
    return this.http.get<Bookmark[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(bookmarks => {
        const idSet = new Set(bookmarks.map(b => b.itemId));
        this.bookmarkedIds.set(idSet);
      })
    );
  }

  toggleBookmark(itemId: string, note?: string): Observable<{ isBookmarked: boolean; message: string }> {
    const userId = this.getUserId();
    const payload: BookmarkToggleRequest = { itemId, userId, note };

    // Optimistic UI update
    const current = new Set(this.bookmarkedIds());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.bookmarkedIds.set(current);

    return this.http.post<{ isBookmarked: boolean; message: string }>(`${this.apiUrl}/toggle`, payload).pipe(
      tap(res => {
        const updated = new Set(this.bookmarkedIds());
        if (res.isBookmarked) {
          updated.add(itemId);
        } else {
          updated.delete(itemId);
        }
        this.bookmarkedIds.set(updated);
      })
    );
  }

  isBookmarked(itemId: string): boolean {
    return this.bookmarkedIds().has(itemId);
  }
}
