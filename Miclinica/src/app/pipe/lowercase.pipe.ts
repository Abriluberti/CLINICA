import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lowerCase',
  standalone: true
})
export class LowerCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase();
  }
}
