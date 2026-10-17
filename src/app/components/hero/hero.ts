import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { LoaderService } from '../../core/loader.service';
import { STILLS, StillImage } from '../../data/images.generated';
import { PROFILE } from '../../data/portfolio.data';

// أرقام صور الهيرو (نفس أسماء الملفات من غير .webp)
const HERO_IDS = ['01', '003', '05', '004'];
// وقت بقاء كل صورة بالمللي ثانية
const SLIDE_MS = 6500;

@Component({
  selector: 'app-hero',
  template: `
    <section class="hero" #root [style.--slide-ms]="slideMs + 'ms'">
      <div class="slides">
        @for (s of slides; track s.id; let i = $index) {
          <div class="slide" [class.active]="ready() && i === current()">
            <img
              [src]="s.src"
              [width]="s.width"
              [height]="s.height"
              alt="Architectural visualization by Mohamed Abd Elnasser"
            />
          </div>
        }
      </div>

      <div class="shade"></div>

      <div class="content">
        <p class="eyebrow mask"><span class="line">Portfolio — {{ year }}</span></p>
        <h1>
          <span class="mask"><span class="line">Mohamed</span></span>
          <span class="mask"><span class="line">Abd Elnasser</span></span>
        </h1>
        <p class="role mask"><span class="line">{{ role }}</span></p>
      </div>

      <div class="footer">
        <div class="counter">
          <span class="now">{{ pad(current() + 1) }}</span>
          <span class="sep">/</span>
          <span>{{ pad(slides.length) }}</span>
        </div>

        <ul class="dots">
          @for (s of slides; track s.id; let i = $index) {
            <li>
              <button
                type="button"
                [class.active]="started() && i === current()"
                (click)="go(i)"
                [attr.aria-label]="'Show slide ' + (i + 1)"
              >
                <span class="bar"></span>
              </button>
            </li>
          }
        </ul>

        <div class="scroll">
          <span>Scroll</span>
          <i></i>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .hero {
      position: relative;
      height: 100svh;
      min-height: 560px;
      overflow: hidden;
      background: #000;
      color: #fff;
    }

    .slides,
    .slide,
    .shade {
      position: absolute;
      inset: 0;
    }

    /* الصورة القديمة تفضل ظاهرة تحت لحد ما الجديدة تظهر كاملة (من غير وميض) */
    .slide {
      opacity: 0;
      transition: opacity 0s linear 1.6s;
    }
    .slide.active {
      opacity: 1;
      z-index: 1;
      transition: opacity 1.6s ease-in-out;
    }

    .slide img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.14);
      transition: transform 0s linear 1.6s;
    }
    /* zoom بطيء (Ken Burns) وهي ظاهرة */
    .slide.active img {
      transform: scale(1);
      transition: transform calc(var(--slide-ms) + 2000ms) linear;
    }

    /* تظليل أغمق من الشمال عشان الاسم يبان وهو في النص */
    .shade {
      z-index: 2;
      background:
        linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 60%),
        linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.35) 0%,
          rgba(0, 0, 0, 0) 30%,
          rgba(0, 0, 0, 0.6) 100%
        );
      pointer-events: none;
    }

    /* الاسم في نص الشاشة على الشمال */
    .content {
      position: absolute;
      z-index: 3;
      left: var(--pad);
      right: var(--pad);
      top: 50%;
      transform: translateY(-50%);
    }

    .eyebrow {
      font-size: 0.78rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 1.1rem;
    }

    /* حجم الاسم: غيّري الرقم الأوسط (4vw) لو عايزاه أكبر أو أصغر */
    h1 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(1.9rem, 4vw, 4.2rem);
      line-height: 1.02;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }
    h1 .mask {
      padding-bottom: 0.1em;
      margin-bottom: -0.1em;
    }

    .role {
      margin-top: 1.4rem;
      font-size: clamp(0.75rem, 1.1vw, 1rem);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.8);
    }

    .footer {
      position: absolute;
      z-index: 3;
      left: var(--pad);
      right: var(--pad);
      bottom: 2.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .counter {
      font-family: var(--font-display);
      font-size: 0.95rem;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.6);
    }
    .counter .now {
      color: #fff;
    }
    .counter .sep {
      margin: 0 0.4em;
    }

    .dots {
      display: flex;
      gap: 0.5rem;
      list-style: none;
    }
    .dots button {
      width: clamp(36px, 6vw, 64px);
      padding: 12px 0;
    }
    .bar {
      position: relative;
      display: block;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      overflow: hidden;
    }
    .bar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: #fff;
      transform: scaleX(0);
      transform-origin: left;
    }
    .dots button.active .bar::after {
      animation: fill var(--slide-ms) linear forwards;
    }
    @keyframes fill {
      to {
        transform: scaleX(1);
      }
    }

    .scroll {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.72rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
    }
    .scroll i {
      position: relative;
      display: block;
      width: 1px;
      height: 44px;
      background: rgba(255, 255, 255, 0.3);
      overflow: hidden;
    }
    .scroll i::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 50%;
      background: #fff;
      animation: drop 1.8s var(--ease-out) infinite;
    }
    @keyframes drop {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(200%);
      }
    }

    @media (max-width: 640px) {
      .scroll span {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .slide img,
      .slide.active img {
        transition: none;
        transform: none;
      }
    }
  `,
})
export class Hero {
  private destroyRef = inject(DestroyRef);
  private loader = inject(LoaderService);
  private root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly slideMs = SLIDE_MS;
  readonly role = PROFILE.role;
  readonly year = new Date().getFullYear();

  readonly slides: StillImage[] = HERO_IDS
    .map((id) => STILLS.find((s) => s.id === id))
    .filter((s): s is StillImage => !!s);

  readonly current = signal(0);
  /** أول صورة تظهر (تحت الـ Preloader) */
  readonly ready = signal(false);
  /** العدّاد والتبديل التلقائي بيبدأوا بعد ما الـ Preloader يخلص */
  readonly started = signal(false);

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      const el = this.root().nativeElement;

      // نخبّي الكلام لحد ما الـ Preloader يترفع
      gsap.set(el.querySelectorAll('.line'), { yPercent: 115 });
      gsap.set(el.querySelectorAll('.footer > *'), { opacity: 0, y: 20 });

      // أول صورة تظهر وتبدأ zoom تحت الـ Preloader
      setTimeout(() => this.ready.set(true), 60);

      this.loader.whenDone().then(() => {
        this.intro();
        this.started.set(true);
        this.startAuto();
      });
    });

    this.destroyRef.onDestroy(() => this.stopAuto());
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  go(i: number) {
    this.current.set(i);
    this.startAuto(); // يعيد العد من الأول
  }

  private next() {
    this.current.update((c) => (c + 1) % this.slides.length);
  }

  private startAuto() {
    this.stopAuto();
    this.timer = setInterval(() => this.next(), SLIDE_MS);
  }

  private stopAuto() {
    if (this.timer) clearInterval(this.timer);
  }

  private intro() {
    const el = this.root().nativeElement;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.1 });

    tl.to(el.querySelectorAll('.line'), {
      yPercent: 0,
      duration: 1.3,
      stagger: 0.12,
    }).to(
      el.querySelectorAll('.footer > *'),
      { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
      '-=0.8',
    );
  }
}