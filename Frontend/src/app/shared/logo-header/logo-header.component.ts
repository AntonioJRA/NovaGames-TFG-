import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo-header',
  imports: [],
  templateUrl: './logo-header.component.html',
  styles: ``,
})
export class LogoHeaderComponent {
  constructor(private router: Router) {}

  navToHome() {
    this.router.navigate(['']);
  }
}
