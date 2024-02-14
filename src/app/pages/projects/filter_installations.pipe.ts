import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter_instalaciones'
})
export class FilterInstallationsPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return items.filter(item => {
      return /*(item.area && item.area.toLowerCase().includes(searchText)) || */(item.nombre && item.nombre.toLowerCase().includes(searchText)) || (item.descripcion && item.descripcion.toLowerCase().includes(searchText));
    });
  }
}