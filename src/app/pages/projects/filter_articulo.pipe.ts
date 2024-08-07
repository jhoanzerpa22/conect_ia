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
    searchText = searchText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    return items.filter(item => {

        return (item.cuerpoLegal && item.cuerpoLegal.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText)) || (item.tituloNorma && item.tituloNorma.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText)) || (item.normaId && item.normaId.replace(/[\n\r]/g, ' ').includes(searchText)) || (item.articulos.findIndex((ar: any) => (ar.articulo && ar.articulo.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText)) || (ar.tipoParte && ar.tipoParte.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText)) || (ar.descripcion && ar.descripcion.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText))) != -1) || (item.articulos.findIndex((ar2: any) => ar2.hijas && ar2.hijas.length > 0 ? (ar2.hijas.findIndex((ar3: any) => (ar3.articulo && ar3.articulo.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText)) || (ar3.tipoParte && ar3.tipoParte.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText)) || (ar3.descripcion && ar3.descripcion.replace(/[\n\r]/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchText))) != -1) : false) != -1);


    });
  }
}