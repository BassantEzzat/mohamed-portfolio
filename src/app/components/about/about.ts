import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from '../../core/reveal.directive';
import { ABOUT } from '../../data/about.data';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  imports: [Reveal],
  template: `
    <section id="about" class="about" #root>
      <div class="grid">
        <div class="media">
          <div class="mask">
            <img
              [src]="d.portrait"
              [alt]="d.portraitAlt"
              loading="lazy"
              decoding="async"
              (error)="$any($event.target).style.visibility = 'hidden'"
            />
          </div>
        </div>

        <div class="copy">
          <div appReveal>
            <p class="eyebrow">{{ d.eyebrow }}</p>
            <h2>{{ d.title }}</h2>
          </div>

          @for (p of d.paragraphs; track $index) {
            <p class="para" appReveal>{{ p }}</p>
          }

          <ul class="stats" appReveal>
            @for (s of d.stats; track s.label) {
              <li>
                <strong class="num" [attr.data-to]="s.value" [attr.data-suffix]="s.suffix">0</strong>
                <span>{{ s.label }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .about {
      padding: clamp(3.5rem, 8vw, 6rem) var(--pad);
      background: var(--bg);
      border-top: 1px solid var(--line);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(1.5rem, 4vw, 4rem);
      max-width: 1100px;
      margin: 0 auto;
    }

    /* الموبايل والتابلت: الصورة فوق النص */
    .media {
      width: 100%;
      max-width: 340px;
      display: flex;
    }
    .mask {
      flex: 1;
      overflow: hidden;
      aspect-ratio: 1 / 1;
      background: var(--bg-soft);
      clip-path: inset(0 0 100% 0);
    }

    /* الكمبيوتر: الصورة بتاخد نفس طول النص بالظبط */
    @media (min-width: 900px) {
      .grid {
        grid-template-columns: 4fr 7fr;
        align-items: stretch;
      }
      .media {
        max-width: none;
      }
      .mask {
        aspect-ratio: auto;
        min-height: 320px;
      }
    }

    .mask img {
      width: 100%;
      height: 115%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }

    .copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .eyebrow {
      margin-bottom: 0.8rem;
      font-size: 0.74rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
    }
 h2 {
  font-size: clamp(1.6rem, 3.6vw, 2.8rem);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-bottom: clamp(1rem, 2.5vw, 1.8rem);
  font-variant-numeric: lining-nums;
  font-feature-settings: 'lnum' 1;
}

    .para {
      max-width: 52ch;
      margin-bottom: 0.9rem;
      font-size: clamp(0.9rem, 1.05vw, 1rem);
      line-height: 1.7;
      color: var(--muted);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 1rem;
      margin: clamp(1.2rem, 3vw, 2rem) 0 0;
      padding: 1rem 0;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      list-style: none;
    }
    .stats strong {
      display: block;
      font-family: var(--font-display);
      font-weight: 500;
      font-size: clamp(1.4rem, 2.8vw, 2rem);
      line-height: 1.1;
    }
    .stats span {
      font-size: 0.66rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }
  `,
})
export class About {
  protected d = ABOUT;

  private root = viewChild.required<ElementRef<HTMLElement>>('root');
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const root = this.root().nativeElement;
      const mm = gsap.matchMedia();

      const ctx = gsap.context(() => {
        // كشف الصورة
        gsap.to('.mask', {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.4,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: '.media', start: 'top 80%', once: true },
        });

        // parallax خفيف للصورة (على الشاشات الكبيرة بس)
        mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            '.mask img',
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: '.media', start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        // عدّاد الأرقام
        root.querySelectorAll<HTMLElement>('.num').forEach((el) => {
          const to = Number(el.dataset['to'] ?? 0);
          const suffix = el.dataset['suffix'] ?? '';
          const o = { v: 0 };
          gsap.to(o, {
            v: to,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => (el.textContent = Math.round(o.v) + suffix),
            onComplete: () => (el.textContent = to + suffix),
          });
        });
      }, root);

      this.destroyRef.onDestroy(() => {
        mm.revert();
        ctx.revert();
      });
    });
  }
}