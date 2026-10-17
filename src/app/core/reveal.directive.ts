import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appReveal]',
  host: { style: 'opacity: 0' },
})
export class Reveal {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;

      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          io.disconnect();
          gsap.fromTo(
            node,
            { opacity: 0, y: 70 },
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', clearProps: 'transform' },
          );
        },
        { rootMargin: '0px 0px -10% 0px' },
      );

      io.observe(node);
    });
  }
}