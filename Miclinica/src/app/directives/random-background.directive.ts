import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appRandomBackground]',
  standalone: true
})
export class RandomBackgroundDirective {

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const randomColor = this.getRandomColor();
    this.el.nativeElement.style.backgroundColor = randomColor;
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}