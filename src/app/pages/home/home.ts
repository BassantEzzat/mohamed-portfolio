import { Component } from '@angular/core';
import { About } from '../../components/about/about';
import { Contact } from '../../components/contact/contact';
import { Hero } from '../../components/hero/hero';
import { Lightbox } from '../../components/lightbox/lightbox';
import { Work } from '../../components/work/work';

@Component({
  selector: 'app-home',
  imports: [Hero, Work, About, Contact, Lightbox],
  template: `
    <app-hero />
    <app-work />
    <app-about />
    <app-contact />

    <app-lightbox />
  `,
})
export class Home {}