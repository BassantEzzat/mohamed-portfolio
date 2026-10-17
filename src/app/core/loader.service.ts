import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  /** بتبقى true لما الـ Preloader يخلص */
  readonly done = signal(false);

  private resolveFn!: () => void;
  private promise = new Promise<void>((resolve) => (this.resolveFn = resolve));

  /** أي component يقدر يستنى لحد ما الـ Preloader يخلص */
  whenDone(): Promise<void> {
    return this.promise;
  }

  finish() {
    if (this.done()) return;
    this.done.set(true);
    this.resolveFn();
  }
}