import { Injectable, signal } from '@angular/core';
import { GALLERY } from '../data/gallery.data';

@Injectable({ providedIn: 'root' })
export class LightboxService {
  /** رقم الصورة المفتوحة، أو null لو مفيش حاجة مفتوحة */
  readonly index = signal<number | null>(null);

  private readonly total = GALLERY.length;

  open(i: number) {
    this.index.set(i);
  }

  close() {
    this.index.set(null);
  }

  next() {
    const i = this.index();
    if (i === null) return;
    this.index.set((i + 1) % this.total);
  }

  prev() {
    const i = this.index();
    if (i === null) return;
    this.index.set((i - 1 + this.total) % this.total);
  }
}