import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'radToDeg', standalone: true })
export class RadToDegPipe implements PipeTransform {
  transform(radians: number): number {
    return radians * (180 / Math.PI); // Formula: rad * 180 / π
  }
}