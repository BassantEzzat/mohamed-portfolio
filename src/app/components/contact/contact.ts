import { Component } from '@angular/core';
import { Reveal } from '../../core/reveal.directive';
import { CONTACT } from '../../data/contact.data';

@Component({
  selector: 'app-contact',
  imports: [Reveal],
  template: `
    <section id="contact" class="contact">
      <div class="grid">
        <div appReveal>
          <p class="eyebrow">{{ d.eyebrow }}</p>
          <h2>{{ d.title }}</h2>
          <p class="text">{{ d.text }}</p>
          <p class="loc">{{ d.location }}</p>
        </div>

        <div class="links" appReveal>
          <a
            class="row"
            [href]="gmailLink"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Email"
          >
            <span class="label">Email</span>
            <span class="value">{{ d.email }}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>

          <a
            class="row"
            [href]="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Chat"
          >
            <span class="label">WhatsApp</span>
            <span class="value">{{ d.whatsappDisplay }}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>

          <ul class="socials">
            @for (s of d.socials; track s.label) {
              <li>
                <a [href]="s.url" target="_blank" rel="noopener noreferrer">{{ s.label }} ↗</a>
              </li>
            }
          </ul>
        </div>
      </div>

      <footer class="foot">
        <p>© {{ year }} Mohamed Abd-Elnasser</p>
        <button type="button" class="top" (click)="toTop()">Back to top ↑</button>
      </footer>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .contact {
      padding: clamp(3.5rem, 8vw, 6rem) var(--pad) 1.5rem;
      background: var(--bg);
      border-top: 1px solid var(--line);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(2rem, 5vw, 4rem);
      max-width: 1100px;
      margin: 0 auto;
    }
    @media (min-width: 900px) {
      .grid {
        grid-template-columns: 5fr 6fr;
        align-items: center;
      }
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
      margin-bottom: 1rem;
    }
    .text {
      max-width: 42ch;
      font-size: clamp(0.9rem, 1.05vw, 1rem);
      line-height: 1.7;
      color: var(--muted);
    }
    .loc {
      margin-top: 1.2rem;
      font-size: 0.72rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    /* صفوف الإيميل والواتساب */
    .links {
      display: flex;
      flex-direction: column;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'label arrow'
        'value arrow';
      align-items: center;
      gap: 0.25rem 1rem;
      padding: 1.2rem 0;
      border-top: 1px solid var(--line);
      transition: color 0.3s, padding 0.4s var(--ease-out);
    }
    .row:last-of-type {
      border-bottom: 1px solid var(--line);
    }
    .label {
      grid-area: label;
      font-size: 0.68rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .value {
  grid-area: value;
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.4vw, 1.5rem);
  word-break: break-all;
  font-variant-numeric: lining-nums;
  font-feature-settings: 'lnum' 1;
}
    .arrow {
      grid-area: arrow;
      font-size: 1.2rem;
      transition: transform 0.4s var(--ease-out);
    }
    @media (hover: hover) {
      .row:hover {
        color: var(--accent);
        padding-left: 0.6rem;
      }
      .row:hover .arrow {
        transform: translate(3px, -3px);
      }
    }

    .socials {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1.4rem;
      list-style: none;
    }
    .socials a {
      display: inline-block;
      padding: 0.45rem 0.9rem;
      border: 1px solid var(--line);
      border-radius: 999px;
      font-size: 0.74rem;
      letter-spacing: 0.05em;
      transition: background-color 0.3s, color 0.3s, border-color 0.3s;
    }
    .socials a:hover {
      background: var(--text);
      color: var(--bg);
      border-color: var(--text);
    }

    /* الفوتر */
    .foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      max-width: 1100px;
      margin: clamp(2.5rem, 6vw, 4.5rem) auto 0;
      padding-top: 1.2rem;
      border-top: 1px solid var(--line);
      font-size: 0.7rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .top {
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      letter-spacing: inherit;
      text-transform: inherit;
      cursor: pointer;
      transition: color 0.3s;
    }
    .top:hover {
      color: var(--accent);
    }
  `,
})
export class Contact {
  protected d = CONTACT;
  protected year = new Date().getFullYear();

  /** بيفتح صفحة كتابة رسالة في Gmail لإيميل محمد */
  protected gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(this.d.email)}`;

  /** بيفتح محادثة واتساب مع محمد برسالة جاهزة */
  protected whatsappLink = `https://wa.me/${this.d.whatsapp}?text=${encodeURIComponent(this.d.whatsappText)}`;

  toTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}