import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styles: ``,
})
export class ButtonComponent {
  @Input() content: string | undefined;
  @Input() extraClasses: string | undefined;
  @Input() disabledClasses: string | undefined;
  @Input() type: string = 'button';
  @Input() disabled: boolean = true;

  @Output() click = new EventEmitter<void>();

  handleClick() {
    this.click.emit();
  }
}
