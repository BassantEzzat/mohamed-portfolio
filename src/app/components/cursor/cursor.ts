import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-cursor',
  template: `
    <div class="ring" #ring><span class="label" #label></span></div>
    <div class="dot" #dot></div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .ring,
    .dot {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
      border-radius: 50%;
      opacity: 0;
      mix-blend-mode: difference;
      will-change: transform;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #fff;
    }

    .ring {
      width: 38px;
      height: 38px;
      border: 1px solid #fff;
      transition:
        width 0.3s var(--ease-out),
        height 0.3s var(--ease-out),
        background-color 0.3s;
    }
    .ring.hover {
      width: 76px;
      height: 76px;
      background: #fff;
    }
    .ring.hover.has-label {
      width: 92px;
      height: 92px;
    }

    .label {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-family: var(--font-body);
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #000;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .ring.has-label .label {
      opacity: 1;
    }
  `,
})
export class Cursor {
  private ring = viewChild.required<ElementRef<HTMLElement>>('ring');
  private dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private label = viewChild.required<ElementRef<HTMLElement>>('label');

  constructor() {
    afterNextRender(() => {
      // على الموبايل واللمس مفيش cursor
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      const ring = this.ring().nativeElement;
      const dot = this.dot().nativeElement;
      const label = this.label().nativeElement;

      gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });

      // ===== السرعة: كل ما الرقم يقل، الحركة أسرع =====
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.1, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.18, ease: 'power3.out' });
      const dotX = gsap.quickTo(dot, 'x', { duration: 0.04, ease: 'none' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.04, ease: 'none' });

      let visible = false;

      window.addEventListener('mousemove', (e) => {
        if (!visible) {
          visible = true;
          gsap.set([ring, dot], { x: e.clientX, y: e.clientY, opacity: 1 });
        }
        ringX(e.clientX);
        ringY(e.clientY);
        dotX(e.clientX);
        dotY(e.clientY);
      });

      // الدايرة تكبر فوق اللينكات والأزرار وأي عنصر عليه data-cursor
      // ولو data-cursor فيه كلمة (زي "View") بتتكتب جوه الدايرة
      document.addEventListener('mouseover', (e) => {
        const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
          'a, button, [data-cursor]',
        );
        const text = target?.getAttribute('data-cursor') ?? '';

        ring.classList.toggle('hover', !!target);
        ring.classList.toggle('has-label', !!text);
        if (text) label.textContent = text;
      });

      document.documentElement.addEventListener('mouseleave', () => {
        gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
      });
      document.documentElement.addEventListener('mouseenter', () => {
        if (visible) gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      });
    });
  }
}