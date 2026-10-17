import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { LightboxService } from '../../core/lightbox.service';
import { Reveal } from '../../core/reveal.directive';
import { GALLERY } from '../../data/gallery.data';
import { StillImage } from '../../data/images.generated';

interface Item {
  img: StillImage;
  index: number;
}

/** عدد الأعمدة حسب عرض الشاشة */
function colsFor(width: number): number {
  if (width >= 1100) return 3;
  if (width >= 640) return 2;
  return 1;
}

@Component({
  selector: 'app-work',
  imports: [Reveal],
  template: `
    <section id="work" class="work">
      <header class="head">
        <div appReveal>
          <p class="eyebrow">Selected Work</p>
          <h2>Stills</h2>
        </div>
        <p class="count" appReveal>{{ images.length }} images</p>
      </header>

      <div class="cols" [style.--cols]="cols()">
        @for (col of columns(); track $index) {
          <div class="col">
            @for (it of col; track it.img.id) {
              <figure
                class="card"
                appReveal
                data-cursor="View"
                role="button"
                tabindex="0"
                (click)="open(it.index)"
                (keydown.enter)="open(it.index)"
              >
                <div class="frame" [style.aspect-ratio]="it.img.width + ' / ' + it.img.height">
                  <img
                    [src]="it.img.thumb"
                    [alt]="'Visualization ' + pad(it.index + 1)"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>{{ pad(it.index + 1) }}</figcaption>
              </figure>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .work {
      --gap: clamp(0.75rem, 1.6vw, 1.5rem);
      padding: clamp(5rem, 12vw, 10rem) var(--pad);
      background: var(--bg);
    }

    .head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: clamp(2.5rem, 6vw, 5rem);
    }
    .eyebrow {
      margin-bottom: 1rem;
      font-size: 0.78rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
    }
    h2 {
      font-size: clamp(2.6rem, 8vw, 7rem);
      text-transform: uppercase;
      letter-spacing: -0.03em;
    }
    .count {
      font-size: 0.78rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--muted);
      padding-bottom: 0.6rem;
    }

    .cols {
      display: grid;
      grid-template-columns: repeat(var(--cols), 1fr);
      gap: var(--gap);
      align-items: start;
    }
    .col {
      display: flex;
      flex-direction: column;
      gap: var(--gap);
      min-width: 0;
    }

    .card {
      position: relative;
      overflow: hidden;
      background: var(--bg-soft);
      cursor: pointer;
    }
    .card:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }

    .frame {
      width: 100%;
      overflow: hidden;
    }
    .frame::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition:
        transform 1.4s var(--ease-out),
        filter 0.6s ease;
    }

    figcaption {
      position: absolute;
      left: 1rem;
      bottom: 0.9rem;
      z-index: 1;
      font-family: var(--font-display);
      font-size: 0.85rem;
      letter-spacing: 0.15em;
      color: #fff;
      opacity: 0;
      transform: translateY(10px);
      transition:
        opacity 0.5s ease,
        transform 0.6s var(--ease-out);
    }

    @media (hover: hover) {
      .card:hover img {
        transform: scale(1.05);
      }
      .card:hover .frame::after {
        opacity: 1;
      }
      .card:hover figcaption {
        opacity: 1;
        transform: none;
      }
      /* باقي الصور تغمق لما تقفي على صورة */
      .cols:hover .card:not(:hover) img {
        filter: brightness(0.55);
      }
    }
  `,
})
export class Work {
  private lightbox = inject(LightboxService);
  private destroyRef = inject(DestroyRef);

  readonly images = GALLERY;
  readonly cols = signal(colsFor(window.innerWidth));

  /** بنوزّع الصور على الأعمدة: كل صورة تروح لأقصر عمود، عشان الأعمدة تبقى متوازنة */
  readonly columns = computed<Item[][]>(() => {
    const n = this.cols();
    const heights: number[] = Array(n).fill(0);
    const out: Item[][] = Array.from({ length: n }, () => []);

    this.images.forEach((img, index) => {
      const shortest = heights.indexOf(Math.min(...heights));
      out[shortest].push({ img, index });
      heights[shortest] += img.height / img.width;
    });

    return out;
  });

  constructor() {
    afterNextRender(() => {
      let timer: ReturnType<typeof setTimeout>;

      const onResize = () => {
        clearTimeout(timer);
        timer = setTimeout(() => this.cols.set(colsFor(window.innerWidth)), 150);
      };

      window.addEventListener('resize', onResize);
      this.destroyRef.onDestroy(() => {
        clearTimeout(timer);
        window.removeEventListener('resize', onResize);
      });
    });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  open(i: number) {
    this.lightbox.open(i);
  }
}