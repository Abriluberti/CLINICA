import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverTrace]',
  standalone: true
})
export class HoverTraceDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const trailElement = this.renderer.createElement('div');
    this.renderer.setStyle(trailElement, 'position', 'absolute');
    this.renderer.setStyle(trailElement, 'top', `${event.clientY}px`);
    this.renderer.setStyle(trailElement, 'left', `${event.clientX}px`);
    this.renderer.setStyle(trailElement, 'width', '10px');
    this.renderer.setStyle(trailElement, 'height', '10px');
    this.renderer.setStyle(trailElement, 'background-color', 'rgba(0, 0, 255, 0.2)');   
    this.renderer.setStyle(trailElement, 'transform', 'rotate(-45deg)');
        this.renderer.setStyle(trailElement, 'pointer-events', 'none');
    this.renderer.setStyle(trailElement, 'transition', 'opacity 0.5s');

    this.renderer.appendChild(document.body, trailElement);

    setTimeout(() => {
      this.renderer.setStyle(trailElement, 'opacity', '0');
      setTimeout(() => {
        this.renderer.removeChild(document.body, trailElement);
      }, 500);
    }, 50);
  }
}