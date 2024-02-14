import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter_cuerpo'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return items.filter(item => {
      return (item.cuerpoLegal && item.cuerpoLegal.replace(/[\n\r]/g, ' ').toLowerCase().includes(searchText)) || (item.tituloNorma && item.tituloNorma.replace(/[\n\r]/g, ' ').toLowerCase().includes(searchText)) || (item.normaId && item.normaId.replace(/[\n\r]/g, ' ').includes(searchText));
    });
  }
}