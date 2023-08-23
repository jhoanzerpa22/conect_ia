/**
 * Detail Model List
 */
export interface DetailModel {
  normaId: any;
  tituloNorma?: string;
  encabezado?: any;
  organismos?: any;
  dates?: any;
  identificador?: any;
  conectado?: string;
}

/**
 * Articulos Model List
 */
export interface ArticulosModel {
  parteId: any;
  tituloNorma?: string;
  dates?: any;
  identificador?: any;
  conectado?: string;
  texto?: string;
  tipoParte?: string;
}

/**
 * Recent Model List
 */
 export interface recentModel {
  id: any;
  icon: string;
  icon_color: string;
  icon_name: string;
  item: string;
  size: string;
  type: string;
  date: string;
  isIcon?:any;
}
/** 
 * Hallazgo Model
*/
export interface HallazgoModel {
  id?: any;
  nombre?: any;
  fecha?: any;
  estado?: any;
}