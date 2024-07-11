import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverTraceDirective]',
  standalone: true
})
export class HoverTraceDirectiveDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight('yellow'); // Cambia el color al pasar el mouse sobre el elemento
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(null); // Vuelve al color original al quitar el mouse
  }

  private highlight(color: string | null) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }
}