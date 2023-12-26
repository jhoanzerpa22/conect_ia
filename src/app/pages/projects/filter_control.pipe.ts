import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter_control'
})
export class FilterControlPipe implements PipeTransform {
  transform(items: any[], search: any): any[] {
    console.log('Busqueda:',search);
    if (!items) {
      return [];
    }
    if (!search) {
      return items;
    }

    if(!search.texto && !search.cuerpo && !search.articulo && !search.tipo && !search.criticidad && !search.atributo){
        return items;
    }

    let texto = '';

    if(search.texto){
        texto = search.texto.toLowerCase();
    }

    return items.filter(item => {
      return (item.area && item.area.toLowerCase().includes(texto)) || (item.descripcion && item.descripcion.toLowerCase().includes(texto))/* || item.normaId.includes(searchText)*/;
    });
  }
}