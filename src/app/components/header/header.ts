import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import gsap from 'gsap';
import { LoaderService } from '../../core/loader.service';
import { SmoothScrollService } from '../../core/smooth-scroll.service';
import { PROFILE } from '../../data/portfolio.data';

@Component({
  selector: 'app-header',
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <header class="bar" #bar>
      <a class="logo" href="#" (click)="top($event)">MA</a>

      <nav class="nav">
        @for (l of links; track l.id) {
          <a [href]="'#' + l.id" (click)="go($event, l.id)">{{ l.label }}</a>
        }
      </nav>

      <button class="burger" type="button" (click)="toggle()" [attr.aria-expanded]="open()">
        {{ open() ? 'Close' : 'Menu' }}
      </button>
    </header>

    <div class="menu" [class.open]="open()" [attr.aria-hidden]="!open()">
      <nav class="menu-links">
        @for (l of links; track l.id; let i = $index) {
          <div class="item">
            <a [href]="'#' + l.id" (click)="go($event, l.id)" [style.--i]="i">
              <span>0{{ i + 1 }}</span>{{ l.label }}
            </a>
          </div>
        }
      </nav>

      <div class="foot">
        <a [href]="p.gmail" target="_blank" rel="noopener noreferrer">{{ p.email }}</a>
        <div class="social">
          <a [href]="p.whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a [href]="p.behance" target="_blank" rel="noopener noreferrer">Behance</a>
          <a [href]="p.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* mix-blend-mode: difference بيخلي الكلام يبان فوق الصور الغامقة والفاتحة */
    .bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem var(--pad);
      color: #fff;
      mix-blend-mode: difference;
    }

    .logo {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
    }

    .nav {
      display: flex;
      gap: clamp(1.5rem, 3vw, 3rem);
    }
    .nav a,
    .burger {
      position: relative;
      font-size: 0.78rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
    }
    .nav a::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -6px;
      height: 1px;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.5s var(--ease-out);
    }
    .nav a:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }

    .burger {
      display: none;
    }

    @media (max-width: 820px) {
      .nav {
        display: none;
      }
      .burger {
        display: block;
      }
    }

    /* ===== المنيو الكاملة (موبايل) ===== */
    .menu {
      position: fixed;
      inset: 0;
      z-index: 150;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 6rem var(--pad) 2.5rem;
      background: var(--bg);
      clip-path: inset(0 0 100% 0);
      visibility: hidden;
      transition:
        clip-path 0.9s cubic-bezier(0.76, 0, 0.24, 1),
        visibility 0s linear 0.9s;
    }
    .menu.open {
      clip-path: inset(0);
      visibility: visible;
      transition:
        clip-path 0.9s cubic-bezier(0.76, 0, 0.24, 1),
        visibility 0s;
    }

    .item {
      overflow: hidden;
    }
    .item a {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(1.6rem, 5.5vw, 3.2rem);
      line-height: 1.25;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      font-variant-numeric: lining-nums;
      transform: translateY(110%);
      transition:
        transform 0.5s ease,
        color 0.3s;
    }
    .item a span {
      font-family: var(--font-body);
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: var(--accent);
    }
    .item a:hover {
      color: var(--accent);
    }
    .menu.open .item a {
      transform: none;
      transition:
        transform 0.9s var(--ease-out) calc(0.3s + var(--i) * 0.08s),
        color 0.3s;
    }

    .foot {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1.5rem;
      font-size: 0.8rem;
      color: var(--muted);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .menu.open .foot {
      opacity: 1;
      transition: opacity 0.6s ease 0.7s;
    }
    .foot a:hover {
      color: var(--text);
    }
    .social {
      display: flex;
      gap: 1.5rem;
    }
  `,
})
export class Header {
  private loader = inject(LoaderService);
  private scroll = inject(SmoothScrollService);
  private bar = viewChild.required<ElementRef<HTMLElement>>('bar');

  readonly p = PROFILE;
  readonly open = signal(false);

  readonly links = [
    { id: 'work', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  constructor() {
    afterNextRender(() => {
      const bar = this.bar().nativeElement;

      // مخفي لحد ما الـ Preloader يخلص
      gsap.set(bar, { yPercent: -100, opacity: 0 });

      this.loader.whenDone().then(() => {
        gsap.to(bar, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.5,
        });
      });
    });
  }

  toggle() {
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
      this.scroll.stop();
    }
  }

  close() {
    if (!this.open()) return;
    this.open.set(false);
    this.scroll.start();
  }

  top(e: Event) {
    e.preventDefault();
    this.close();
    this.scroll.scrollTo(0);
  }

  go(e: Event, id: string) {
    e.preventDefault();
    const wasOpen = this.open();
    this.close();
    // لو المنيو كانت مفتوحة نستنى تقفل شوية قبل السكرول
    setTimeout(() => this.scroll.scrollTo('#' + id), wasOpen ? 500 : 0);
  }
}