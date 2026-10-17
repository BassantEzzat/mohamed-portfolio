import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Cursor } from './components/cursor/cursor';
import { Header } from './components/header/header';
import { Preloader } from './components/preloader/preloader';
import { SmoothScrollService } from './core/smooth-scroll.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Cursor, Header, Preloader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private scroll = inject(SmoothScrollService);

  ngOnInit() {
    this.scroll.init();
  }
}