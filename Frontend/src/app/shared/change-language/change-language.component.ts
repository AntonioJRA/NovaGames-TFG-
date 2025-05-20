import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-change-language',
  imports: [CommonModule],
  templateUrl: './change-language.component.html',
  styles: ``,
})
export class ChangeLanguageComponent {
  @Input() extraClasses: string | undefined;

  constructor(public langServ: LanguageService) {}
}
