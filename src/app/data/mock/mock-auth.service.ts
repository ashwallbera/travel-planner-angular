import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '../../core/models';
import { InMemoryStore } from './in-memory-store';

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly store = inject(InMemoryStore);
  private readonly router = inject(Router);

  private readonly currentUserId = signal<string | null>(this.readSession());

  readonly currentUser = computed<User | null>(() => {
    const id = this.currentUserId();
    if (!id) return null;
    return this.store.snapshot().users.find((u) => u.id === id) ?? null;
  });

  readonly isAuthenticated = computed(() => this.currentUserId() !== null);

  login(email: string, _password: string): boolean {
    const user = this.store.snapshot().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) return false;
    this.setSession(user.id);
    return true;
  }

  signup(email: string, displayName: string, _password: string): boolean {
    const exists = this.store.snapshot().users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (exists) return false;
    const id = `u-${Date.now()}`;
    this.store.update((d) => {
      d.users.push({ id, email, displayName });
    });
    this.setSession(id);
    return true;
  }

  logout(): void {
    this.currentUserId.set(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('tp-auth-user');
    }
    void this.router.navigate(['/auth/login']);
  }

  private setSession(userId: string): void {
    this.currentUserId.set(userId);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tp-auth-user', userId);
    }
  }

  private readSession(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem('tp-auth-user');
  }
}
