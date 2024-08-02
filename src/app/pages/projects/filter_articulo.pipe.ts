import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter_cuerpo_articulo'
})
export class FilterCuerpoArticuloPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return items.filter(item => {
      return (item.cuerpoLegal && item.cuerpoLegal.replace(/[\n\r]/g, ' ').toLowerCase().includes(searchText)) || (item.tituloNorma && item.tituloNorma.replace(/[\n\r]/g, ' ').toLowerCase().includes(searchText)) || (item.normaId && item.normaId.replace(/[\n\r]/g, ' ').includes(searchText)) || (item.articulos.findIndex((ar: any) => (ar.articulo && ar.articulo.replace(/[\n\r]/g, ' ').toLowerCase().includes(searchText)) || (ar.tipoParte && ar.tipoParte.replace(/[\n\r]/g, ' ').toLowerCase().includes(searchText)) || (ar.descripcion && ar.descripcion.replace(/[\n\r]/g, ' ').includes(searchText))) != -1);
    });
  }
}