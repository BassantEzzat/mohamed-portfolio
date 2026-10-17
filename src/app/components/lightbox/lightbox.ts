import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LightboxService } from '../../core/lightbox.service';
import { SmoothScrollService } from '../../core/smooth-scroll.service';
import { GALLERY } from '../../data/gallery.data';

const MAX_SCALE = 5;

@Component({
  selector: 'app-lightbox',
  host: { '(window:keydown)': 'onKey($event)' },
  template: `
    <div
      class="lb"
      [class.open]="isOpen()"
      [class.zoomed]="zoomed()"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      data-lenis-prevent
    >
      <div
        class="stage"
        #stage
        (pointerdown)="onDown($event)"
        (pointermove)="onMove($event)"
        (pointerup)="onUp($event)"
        (pointercancel)="onUp($event)"
      >
        <div class="pan" #pan [style.width.px]="box().w" [style.height.px]="box().h">
          <img
            class="ph"
            [class.hide]="loaded()"
            [attr.src]="current()?.thumb"
            alt=""
            draggable="false"
          />
          <img
            class="full"
            [class.ready]="loaded()"
            [attr.src]="current()?.src"
            [alt]="'Visualization ' + label()"
            draggable="false"
            (load)="loaded.set(true)"
          />
        </div>
      </div>

      <div class="bar">
        <span class="counter">{{ label() }} <i>/</i> {{ images.length }}</span>

        <div class="tools">
          <button type="button" aria-label="Zoom out" (click)="zoomCenter(1 / 1.6)">−</button>
          <button type="button" aria-label="Zoom in" (click)="zoomCenter(1.6)">+</button>
          <button type="button" class="close" aria-label="Close" (click)="lb.close()">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.5" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      <button type="button" class="nav prev" aria-label="Previous image" (click)="lb.prev()">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </button>
      <button type="button" class="nav next" aria-label="Next image" (click)="lb.next()">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </button>

      <p class="hint">Scroll to zoom · Drag to move · ← → to browse</p>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .lb {
      position: fixed;
      inset: 0;
      z-index: 8500;
      background: rgba(8, 8, 8, 0.97);
      color: #fff;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition:
        opacity 0.4s ease,
        visibility 0.4s;
    }
    .lb.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .stage {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      overflow: hidden;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      cursor: zoom-in;
    }
    .lb.zoomed .stage {
      cursor: grab;
    }
    .lb.zoomed .stage:active {
      cursor: grabbing;
    }

    .pan {
      position: relative;
      will-change: transform;
    }
    .pan img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      -webkit-user-drag: none;
      pointer-events: none;
    }
    .ph {
      filter: blur(8px);
      transition: opacity 0.5s ease 0.1s;
    }
    .ph.hide {
      opacity: 0;
    }
    .full {
      opacity: 0;
      transition: opacity 0.45s ease;
    }
    .full.ready {
      opacity: 1;
    }

    /* الشريط اللي فوق */
    .bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: clamp(0.6rem, 2vw, 1.4rem) clamp(0.75rem, 3vw, 2rem);
      pointer-events: none;
    }
    .bar > * {
      pointer-events: auto;
    }
    .counter {
      font-family: var(--font-display);
      font-size: 0.85rem;
      letter-spacing: 0.2em;
    }
    .counter i {
      font-style: normal;
      color: var(--muted);
      margin: 0 0.15em;
    }
    .tools {
      display: flex;
      gap: 0.4rem;
    }

    button {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.04);
      color: #fff;
      font-size: 1.3rem;
      line-height: 1;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition:
        background-color 0.3s,
        border-color 0.3s;
    }
    button:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    @media (hover: hover) {
      button:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }

    .nav {
      position: absolute;
      top: 50%;
      translate: 0 -50%;
    }
    .prev {
      left: clamp(0.75rem, 2vw, 2rem);
    }
    .next {
      right: clamp(0.75rem, 2vw, 2rem);
    }

    .hint {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 1.2rem;
      text-align: center;
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
      pointer-events: none;
    }

    /* الموبايل: الأسهم تنزل تحت، والـ hint يختفي (فيه سوايب) */
    @media (max-width: 640px) {
      .nav {
        top: auto;
        bottom: 0.9rem;
        translate: none;
      }
      .prev {
        left: 0.9rem;
      }
      .next {
        right: 0.9rem;
      }
      .hint {
        display: none;
      }
    }
    @media (hover: none) {
      .hint {
        display: none;
      }
    }
  `,
})
export class Lightbox {
  protected lb = inject(LightboxService);
  private scroll = inject(SmoothScrollService);
  private destroyRef = inject(DestroyRef);

  private stage = viewChild<ElementRef<HTMLElement>>('stage');
  private pan = viewChild<ElementRef<HTMLElement>>('pan');

  readonly images = GALLERY;
  readonly current = computed(() => {
    const i = this.lb.index();
    return i === null ? null : this.images[i];
  });
  readonly isOpen = computed(() => this.lb.index() !== null);
  readonly label = computed(() => String((this.lb.index() ?? 0) + 1).padStart(2, '0'));

  readonly loaded = signal(false);
  readonly zoomed = signal(false);
  readonly box = signal({ w: 0, h: 0 });

  // حالة الـ zoom والسحب
  private s = 1;
  private tx = 0;
  private ty = 0;

  private pointers = new Map<number, { x: number; y: number }>();
  private pinch = { dist: 1, scale: 1 };
  private pinched = false;
  private down = { x: 0, y: 0, moved: false, onImage: false };
  private lastTap = { t: 0, x: 0, y: 0 };
  private wasOpen = false;

  constructor() {
    // لما الصورة تتغير أو تتفتح/تتقفل
    effect(() => {
      const i = this.lb.index();
      untracked(() => {
        this.s = 1;
        this.tx = 0;
        this.ty = 0;
        this.loaded.set(false);
        this.apply(false);

        if (i !== null) {
          if (!this.wasOpen) {
            this.scroll.stop();
            this.wasOpen = true;
          }
          this.fit();
          this.preloadNeighbors(i);
        } else if (this.wasOpen) {
          this.scroll.start();
          this.wasOpen = false;
        }
      });
    });

    afterNextRender(() => {
      const stage = this.stage()!.nativeElement;

      const onWheel = (e: WheelEvent) => {
        if (!this.isOpen()) return;
        e.preventDefault();
        const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
        this.zoomAt(e.clientX, e.clientY, this.s * f, false);
      };
      stage.addEventListener('wheel', onWheel, { passive: false });

      const onResize = () => {
        if (!this.isOpen()) return;
        this.fit();
        this.clamp();
        this.apply(false);
      };
      window.addEventListener('resize', onResize);

      this.destroyRef.onDestroy(() => {
        stage.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
      });
    });
  }

  // ========== لوحة المفاتيح ==========
  onKey(e: KeyboardEvent) {
    if (!this.isOpen()) return;
    switch (e.key) {
      case 'Escape':
        this.lb.close();
        break;
      case 'ArrowRight':
        this.lb.next();
        break;
      case 'ArrowLeft':
        this.lb.prev();
        break;
      case '+':
      case '=':
        this.zoomCenter(1.6);
        break;
      case '-':
        this.zoomCenter(1 / 1.6);
        break;
      case '0':
        this.zoomAtCenter(1);
        break;
    }
  }

  // ========== الماوس واللمس ==========
  onDown(e: PointerEvent) {
    const stage = this.stage()!.nativeElement;
    stage.setPointerCapture(e.pointerId);

    if (this.pointers.size === 0) this.pinched = false;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 2) {
      this.pinched = true;
      this.pinch = { dist: this.dist() || 1, scale: this.s };
    } else {
      this.down = {
        x: e.clientX,
        y: e.clientY,
        moved: false,
        onImage: !!(e.target as HTMLElement).closest('.pan'),
      };
    }
  }

  onMove(e: PointerEvent) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;

    if (this.pointers.size === 2) {
      const m = this.mid();
      this.zoomAt(m.x, m.y, (this.pinch.scale * this.dist()) / this.pinch.dist, false);
      return;
    }

    if (Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 8) {
      this.down.moved = true;
    }

    if (this.s > 1.01) {
      // الصورة مكبّرة: نحرّكها
      this.tx += dx;
      this.ty += dy;
      this.clamp();
      this.apply(false);
    } else if (this.down.moved && !this.pinched) {
      // الصورة عادية: بتتحرك مع الصباع (سوايب)
      this.tx += dx;
      this.ty += dy;
      this.apply(false);
    }
  }

  onUp(e: PointerEvent) {
    if (!this.pointers.delete(e.pointerId)) return;
    if (this.pointers.size > 0) return;

    // بعد قرصة: لو رجعت لحجمها الطبيعي نظبطها
    if (this.pinched) {
      if (this.s <= 1.01) this.resetView(true);
      return;
    }

    const dx = e.clientX - this.down.x;
    const dy = e.clientY - this.down.y;

    if (this.s <= 1.01 && this.down.moved) {
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        this.resetView(false);
        dx < 0 ? this.lb.next() : this.lb.prev();
        return;
      }
      if (dy > 110 && Math.abs(dy) > Math.abs(dx)) {
        this.resetView(false);
        this.lb.close();
        return;
      }
      this.resetView(true);
      return;
    }

    if (this.down.moved) return;

    // ===== ضغطة (tap) =====
    const now = Date.now();
    const isDouble =
      now - this.lastTap.t < 300 &&
      Math.hypot(e.clientX - this.lastTap.x, e.clientY - this.lastTap.y) < 30;

    if (isDouble && this.down.onImage) {
      this.lastTap.t = 0;
      this.zoomAt(e.clientX, e.clientY, this.s > 1.01 ? 1 : 2.5, true);
      return;
    }

    this.lastTap = { t: now, x: e.clientX, y: e.clientY };

    // الضغط على الخلفية (برّه الصورة) يقفل
    if (!this.down.onImage && this.s <= 1.01) this.lb.close();
  }

  // ========== أزرار + و − ==========
  zoomCenter(factor: number) {
    const r = this.stage()!.nativeElement.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, this.s * factor, true);
  }

  private zoomAtCenter(scale: number) {
    const r = this.stage()!.nativeElement.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, scale, true);
  }

  // ========== الحسابات ==========
  /** تكبير حوالين نقطة معينة (مكان الماوس أو الصوابع) */
  private zoomAt(clientX: number, clientY: number, target: number, animate: boolean) {
    const r = this.stage()!.nativeElement.getBoundingClientRect();
    const cx = clientX - (r.left + r.width / 2);
    const cy = clientY - (r.top + r.height / 2);

    const next = Math.min(MAX_SCALE, Math.max(1, target));
    const k = next / this.s;

    this.tx = cx - (cx - this.tx) * k;
    this.ty = cy - (cy - this.ty) * k;
    this.s = next;

    if (this.s <= 1.001) {
      this.s = 1;
      this.tx = 0;
      this.ty = 0;
    }

    this.clamp();
    this.apply(animate);
  }

  /** منع الصورة المكبّرة إنها تطلع برّه الشاشة */
  private clamp() {
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    const { w, h } = this.box();
    const mx = Math.max(0, (w * this.s - stage.clientWidth) / 2);
    const my = Math.max(0, (h * this.s - stage.clientHeight) / 2);
    this.tx = Math.min(mx, Math.max(-mx, this.tx));
    this.ty = Math.min(my, Math.max(-my, this.ty));
  }

  private resetView(animate: boolean) {
    this.s = 1;
    this.tx = 0;
    this.ty = 0;
    this.apply(animate);
  }

  private apply(animate: boolean) {
    const el = this.pan()?.nativeElement;
    if (!el) return;
    el.style.transition = animate ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    el.style.transform = `translate3d(${this.tx}px, ${this.ty}px, 0) scale(${this.s})`;
    this.zoomed.set(this.s > 1.01);
  }

  /** حجم الصورة عشان تتحط كلها في الشاشة بهوامش مناسبة للحجم */
  private fit() {
    const stage = this.stage()?.nativeElement;
    const img = this.current();
    if (!stage || !img) return;

    const small = window.innerWidth < 640;
    const mx = small ? 8 : 72;
    const my = small ? 64 : 76;

    const k = Math.min(
      (stage.clientWidth - mx * 2) / img.width,
      (stage.clientHeight - my * 2) / img.height,
    );

    this.box.set({ w: Math.round(img.width * k), h: Math.round(img.height * k) });
  }

  private preloadNeighbors(i: number) {
    const n = this.images.length;
    for (const j of [(i + 1) % n, (i - 1 + n) % n]) {
      new Image().src = this.images[j].src;
    }
  }

  private dist(): number {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private mid() {
    const [a, b] = [...this.pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
}