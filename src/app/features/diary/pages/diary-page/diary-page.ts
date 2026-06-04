import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import type { DiaryEntry } from '../../../../core/models';
import { DIARY_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-diary-page',
  standalone: true,
  imports: [FormsModule, PageHeader, EmptyState],
  templateUrl: './diary-page.html',
  styleUrl: './diary-page.scss',
})
export class DiaryPage {
  readonly ctx = inject(TripContextService);
  private readonly diary = inject(DIARY_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  showNoteForm = signal(false);
  lightbox = signal<DiaryEntry | null>(null);
  noteContent = '';
  caption = '';

  readonly entries = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.diary.list(id)),
    ),
    { initialValue: [] },
  );

  onPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG are supported.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      alert('Maximum file size is 10MB.');
      return;
    }
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.diary
        .create({
          tripId,
          type: 'photo',
          content: reader.result as string,
          caption: this.caption || undefined,
          dateTag: new Date().toISOString().slice(0, 10),
          authorId: user.id,
          authorName: user.displayName,
        })
        .subscribe();
      this.caption = '';
    };
    reader.readAsDataURL(file);
  }

  addNote(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.noteContent.trim()) return;
    this.diary
      .create({
        tripId,
        type: 'note',
        content: this.noteContent.trim(),
        dateTag: new Date().toISOString().slice(0, 10),
        authorId: user.id,
        authorName: user.displayName,
      })
      .subscribe(() => {
        this.noteContent = '';
        this.showNoteForm.set(false);
      });
  }

  canDelete(entry: DiaryEntry): boolean {
    const user = this.auth.currentUser();
    const trip = this.ctx.trip();
    if (!user || !trip) return false;
    return entry.authorId === user.id || trip.organizerId === user.id;
  }

  deleteEntry(entry: DiaryEntry): void {
    if (!confirm('Delete this entry?')) return;
    this.diary.delete(entry.id).subscribe(() => this.lightbox.set(null));
  }

  downloadPhoto(entry: DiaryEntry): void {
    if (typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = entry.content;
    a.download = `diary-${entry.id}.jpg`;
    a.click();
  }
}
