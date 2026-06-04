import { Component, model } from '@angular/core';

const PRESETS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
];

@Component({
  selector: 'app-cover-photo-picker',
  standalone: true,
  templateUrl: './cover-photo-picker.html',
  styleUrl: './cover-photo-picker.scss',
})
export class CoverPhotoPicker {
  readonly coverUrl = model<string | undefined>(undefined);
  readonly presets = PRESETS;

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.coverUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  selectPreset(url: string): void {
    this.coverUrl.set(url);
  }
}
