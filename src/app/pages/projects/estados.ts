/**
 * Estados de Cumplimiento
 */
const estadosData = [
  /**DEFAULT */
  {value: 'CUMPLE', label: 'Cumple', type: null, category: 'CUMPLE'},
  {value: 'CUMPLE PARCIALMENTE', label: 'Cumple parcial', type: null, category: 'CUMPLE PARCIALMENTE'},
  {value: 'NO CUMPLE', label: 'No cumple', type: null, category: 'NO CUMPLE'},
  /**PERMISOS*/
  {value: 'Aprobado y vigente', label: 'Aprobado y vigente', type: 'permiso', category: 'CUMPLE'},
  {value: 'Actualizado/Regularizado', label: 'Actualizado/Regularizado', type: 'permiso', category: 'CUMPLE'},
  {value: 'Desmovilizado', label: 'Desmovilizado', type: 'permiso', category: 'CUMPLE PARCIALMENTE'},
  {value: 'Desactualizado', label: 'Desactualizado', type: 'permiso', category: 'CUMPLE PARCIALMENTE'}, 
  {value: 'Rechazado', label: 'Rechazado', type: 'permiso', category: 'NO CUMPLE'},
  {value: 'Caducado', label: 'Caducado', type: 'permiso', category: 'NO CUMPLE'},
  {value: 'Suspendido', label: 'Suspendido', type: 'permiso', category: 'NO CUMPLE'},
  {value: 'Revocado', label: 'Revocado', type: 'permiso', category: 'NO CUMPLE'},
  {value: 'Por Gestionar', label: 'Por Gestionar', type: 'permiso', category: 'NO CUMPLE'},
  {value: 'En elaboración', label: 'En elaboración', type: 'permiso', category: 'NO CUMPLE'},
  {value: 'En trámite', label: 'En trámite', type: 'permiso', category: 'NO CUMPLE'},
  /**REPORTES*/
  {value: 'Reporte Regularizado', label: 'Reporte Regularizado', type: 'reporte', category: 'CUMPLE'},
  {value: 'Reportado dentro del plazo sin desviaciones', label: 'Reportado dentro del plazo sin desviaciones', type: 'reporte', category: 'CUMPLE'},
  {value: 'Reportado fuera de plazo con desviaciones', label: 'Reportado fuera de plazo con desviaciones', type: 'reporte', category: 'CUMPLE PARCIALMENTE'},
  {value: 'Reportado fuera de plazo sin desviaciones', label: 'Reportado fuera de plazo sin desviaciones', type: 'reporte', category: 'CUMPLE PARCIALMENTE'}, 
  {value: 'Reportado dentro del plazo con desviaciones', label: 'Reportado dentro del plazo con desviaciones', type: 'reporte', category: 'CUMPLE PARCIALMENTE'}, 
  {value: 'No reportado', label: 'No reportado', type: 'reporte', category: 'NO CUMPLE'},
  /**MONITOREOS*/
  {value: 'Monitoreo Regularizado', label: 'Monitoreo Regularizado', type: 'monitoreo', category: 'CUMPLE'},
  {value: 'Ejecutado dentro del plazo sin desviaciones', label: 'Ejecutado dentro del plazo sin desviaciones', type: 'monitoreo', category: 'CUMPLE'},
  {value: 'Ejecutado fuera de plazo con desviaciones', label: 'Ejecutado fuera de plazo con desviaciones', type: 'monitoreo', category: 'CUMPLE PARCIALMENTE'},
  {value: 'Ejecutado fuera de plazo sin desviaciones', label: 'Ejecutado fuera de plazo sin desviaciones', type: 'monitoreo', category: 'CUMPLE PARCIALMENTE'}, 
  {value: 'Ejecutado dentro del plazo con desviaciones', label: 'Ejecutado dentro del plazo con desviaciones', type: 'monitoreo', category: 'CUMPLE PARCIALMENTE'}, 
  {value: 'No ejecutado', label: 'No ejecutado', type: 'monitoreo', category: 'NO CUMPLE'}, 
  {value: 'En ejecución', label: 'En ejecución', type: 'monitoreo', category: 'NO CUMPLE'}
];

export { estadosData };