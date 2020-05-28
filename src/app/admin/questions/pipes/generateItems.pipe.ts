import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'generateItems'
})
export class GenerateItemsPipe implements PipeTransform {

  transform(value) : any {
    const res = [];
    for (let i = 0; i <= value; i++) {
        res.push(i);
      }
      return res;
  }

}
