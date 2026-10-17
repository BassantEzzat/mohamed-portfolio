import { Injectable, NgZone, inject } from '@angular/core';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private zone = inject(NgZone);
  private lenis?: Lenis;

  init() {
    if (this.lenis) return;
    gsap.registerPlugin(ScrollTrigger);

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        // كل ما الرقم يكبر، الحركة بتلحق الماوس أسرع (أقل نعومة)
        lerp: 0.14,
        // سرعة عجلة الماوس: 1 عادي، 1.5 أسرع، 2 سريع جداً
        wheelMultiplier: 1.5,
        smoothWheel: true,
      });

      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => this.lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    });
  }

  stop() {
    this.lenis?.stop();
  }

  start() {
    this.lenis?.start();
  }

  scrollTo(target: string | number | HTMLElement, immediate = false) {
    this.lenis?.scrollTo(target as any, { immediate });
  }
}