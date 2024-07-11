import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appChangeBackgroundHover]',
  standalone: true
})
export class ChangeBackgroundHoverDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.changeBackgroundColor('#ff69b4'); // Cambia el color de fondo al pasar el mouse a rosa
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.changeBackgroundColor(null); // Restaura el color de fondo cuando el mouse sale
  }

  private changeBackgroundColor(color: string | null) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }
}
