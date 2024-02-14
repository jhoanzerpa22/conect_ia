import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter_area'
})
export class FilterAreaPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    console.log('items==>',items);
    console.log('findIndex',items.findIndex(item => 
        item.instalaciones.findIndex((ins: any) => ins.nombre.toLowerCase().includes(searchText) || ins.descripcion.toLowerCase().includes(searchText)) != -1));
    return items.filter(item => {
      return (item.area && item.area.toLowerCase().includes(searchText)) || (/*item.instalaciones && item.instalaciones.length > 0 && */item.instalaciones.findIndex((ins: any) => ins.nombre.toLowerCase().includes(searchText) || ins.descripcion.toLowerCase().includes(searchText)) != -1);
    });
  }
}