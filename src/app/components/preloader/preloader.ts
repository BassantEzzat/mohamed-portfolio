import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import gsap from 'gsap';
import { LoaderService } from '../../core/loader.service';
import { SmoothScrollService } from '../../core/smooth-scroll.service';
import { STILLS } from '../../data/images.generated';

// الكلمة اللي بتظهر في شاشة التحميل (غيّريها زي ما تحبي)
const LABEL = 'Mohamed Portfolio';

@Component({
  selector: 'app-preloader',
  host: { '[class.gone]': 'gone()' },
  template: `
    <div class="loader" #root>
      <div class="center fade">
        <div class="label-wrap">
          <span class="label" #label>{{ text }}</span>
        </div>
        <div class="track"><i #bar></i></div>
      </div>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 9000;
      display: block;
    }
    :host.gone {
      display: none;
    }

    .loader {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: var(--bg);
      color: var(--text);
    }

    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.1rem;
    }

    .label-wrap {
      overflow: hidden;
      padding: 0.3em 0;
    }
    .label {
      display: block;
      font-family: var(--font-display);
      font-weight: 500;
      font-size: clamp(0.8rem, 1.6vw, 1.05rem);
      letter-spacing: 0.4em;
      margin-right: -0.4em; /* عشان المسافة بعد آخر حرف ما تخليش الكلمة مش في النص */
      text-transform: uppercase;
    }

    .track {
      width: clamp(110px, 14vw, 170px);
      height: 1px;
      background: rgba(255, 255, 255, 0.15);
      overflow: hidden;
    }
    .track i {
      display: block;
      height: 100%;
      background: var(--accent);
      transform: scaleX(0);
      transform-origin: left;
    }
  `,
})
export class Preloader {
  private loader = inject(LoaderService);
  private scroll = inject(SmoothScrollService);

  private root = viewChild.required<ElementRef<HTMLElement>>('root');
  private label = viewChild.required<ElementRef<HTMLElement>>('label');
  private bar = viewChild.required<ElementRef<HTMLElement>>('bar');

  readonly text = LABEL;
  readonly gone = signal(false);

  constructor() {
    afterNextRender(async () => {
      const root = this.root().nativeElement;
      const label = this.label().nativeElement;
      const bar = this.bar().nativeElement;
      const fades = root.querySelectorAll('.fade');

      // قفل السكرول طول التحميل
      this.scroll.stop();

      // نحمّل أول صورة في الهيرو فعلاً
      const first = STILLS.find((s) => s.id === '01');
      const imageReady = first ? this.preload(first.src) : Promise.resolve();

      gsap.set(label, { yPercent: 110 });
      gsap.set(bar, { scaleX: 0 });

      // الكلمة تطلع من تحت، والخط بيتملي
      await new Promise<void>((resolve) => {
        gsap
          .timeline({ onComplete: resolve })
          .to(label, { yPercent: 0, duration: 1, ease: 'power4.out' })
          .to(bar, { scaleX: 0.9, duration: 1.2, ease: 'power1.inOut' }, 0.2)
          .to({}, { duration: 0.2 });
      });

      // نتأكد إن أول صورة اتحمّلت، وبعدها الخط يكمّل
      await imageReady;
      await new Promise<void>((resolve) => {
        gsap.to(bar, { scaleX: 1, duration: 0.3, ease: 'power1.out', onComplete: resolve });
      });

      // الخروج: الكلام يختفي، والشاشة تطلع لفوق
      gsap
        .timeline({
          onComplete: () => {
            this.gone.set(true);
            this.scroll.start();
          },
        })
        .to(fades, { opacity: 0, y: -16, duration: 0.45, ease: 'power2.in' })
        .to(root, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '-=0.1')
        // نبلّغ الباقي (Hero و Header) إن الموقع بدأ يظهر
        .add(() => this.loader.finish(), '-=0.7');
    });
  }

  private preload(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // لو حصل خطأ ما نعلقش الموقع
      img.src = src;
    });
  }
}