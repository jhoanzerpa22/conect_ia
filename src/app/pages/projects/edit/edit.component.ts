import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';

// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

/**
 * Create Component
 */
export class EditComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  typeCreate: boolean = false;
  editForm!: UntypedFormGroup;
  nombreProyecto: any = '';
  descripcionProyecto: any = '';
  regionProyecto: any = '';
  comunaProyecto: any = '';
  tipoZonaProyecto: any = '';
  sectorProyecto: any = '';
  actividadProyecto: any = '';
  tipoProyecto: any = 'requisito';
  types: any = [];
  tipo: any = 'requisito';

  regions: any = [];
  comunes: any = [];
  zones: any = [];

  step: number = 1;

  selectValues: any = [];
  selected: number = 0;
  selected2: number = 0;
  disabled: boolean = true;

  public Editor = ClassicEditor;

  keyword = 'name';
  keyword2 = 'name';

  proyecto_id: any = '';
  project: any = {};

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      //{ label: 'Requisitos legales' },
      { label: 'Proyectos' },
      { label: 'Editar Proyecto', active: true }
    ];

    this.editForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      regionId: ['', [Validators.required]],
      comunaId: ['', [Validators.required]],
      tipoZonaId: ['', [Validators.required]],
      sector: [''],
      actividad: [''],
      tipo: ['requisito']
    });

    this.route.params.subscribe(params => {
      if(params['id'] != ''){  
        this.proyecto_id = params['id'];      
        this.getProject(params['id']);
      }
    });

    this.getTypes();
    this.getRegions();
    this.getZones();
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.editForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

   // Sectores Data
  public Sectores = [
    {
      id: 1,
      name: 'Energía',
    },
    {
      id: 2,
      name: 'Minería',
    },
    {
      id: 3,
      name: 'Portuario',
    },
    {
      id: 4,
      name: 'Silvoagropecuario',
    },
    {
      id: 5,
      name: 'Industria Manufacturera',
    },
    {
      id: 6,
      name: 'Pesca',
    },
    {
      id: 7,
      name: 'Retail',
    },
    {
      id: 8,
      name: 'Construcción',
    },
    {
      id: 9,
      name: 'Transporte y Comunicaciones',
    },
    {
      id: 10,
      name: 'Comercio',
    },
    {
      id: 11,
      name: 'Hoteles y Restoranes',
    }
  ];

   // Actividades Data
   public Actividades = [
    {
      id: 1,
      name: 'Almacenamiento de residuos peligrosos',
    },
    {
      id: 2,
      name: 'Almacenamiento de sustancias peligrosas',
    },
    {
      id: 3,
      name: 'Almacenamiento de combustibles',
    },
    {
      id: 4,
      name: 'Transporte de sustancias peligrosas',
    },
    {
      id: 5,
      name: 'Tratamiento de residuos líquidos',
    }
  ];

  selectEvent(item: any) {  }
  onChangeSearch(search: any) {}
  onFocused(e: any) { }
  
  selectEvent2(item: any) {  }
  onChangeSearch2(search: any) {}
  onFocused2(e: any) { }

   selectVariable(id: any){
    const index = this.selectValues.indexOf(id);
    if(index != -1){
      this.selectValues.splice(index, 1);
    }else{
      this.selectValues.push(id);
    }
  }
 
   validateVariable(id: any){
    const index = this.selectValues.indexOf(id);
    if(index != -1){
      return true;
    }else{
      return false;
    }
 }
 
 setValue(project?: any){

    let sector_index: any = this.Sectores.findIndex((sec: any) => sec.id == project.sectorProductivoId); 
    
    let sector: any = sector_index != -1 ? this.Sectores[sector_index].name : null; 

    this.editForm.controls['nombre'].setValue(project.nombre);
    this.editForm.controls['descripcion'].setValue(project.descripcion);
    this.editForm.controls['regionId'].setValue('');
    this.editForm.controls['comunaId'].setValue('');
    this.editForm.controls['tipoZonaId'].setValue('');
    this.editForm.controls['sector'].setValue(sector);
    this.editForm.controls['actividad'].setValue(project.actividad);
    this.editForm.controls['tipo'].setValue(project.tipo);
 }
 
 getProject(idProject?: any){
  this.projectsService.getById(idProject).pipe().subscribe(
    (data: any) => {
      this.project = data.data;
      this.setValue(this.project);
  },
  (error: any) => {
    //this.error = error ? error : '';
    //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
  });
}

   getTypes(){
    this.projectsService.getTypes().pipe().subscribe(
      (data: any) => {
        this.types = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
   }

   getRegions(){
    this.projectsService.getRegiones().pipe().subscribe(
      (data: any) => {
        this.regions = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
   }

   getComunes(e?: any){
    this.comunes = [];
    let id: any = e.value;
    if(id){
      this.projectsService.getComunas(id).pipe().subscribe(
        (data: any) => {
          this.comunes = data.data;
      },
      (error: any) => {
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
    }
   }

   getZones(){
    this.projectsService.getZones().pipe().subscribe(
      (data: any) => {
        this.zones = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
   }

   editProject(type: any){
    // stop here if form is invalid
    if (this.editForm.invalid) {
      return;
    }

    this.nombreProyecto = this.f['nombre'].value;
    this.descripcionProyecto = this.f['descripcion'].value;
    this.regionProyecto = this.f['regionId'].value;
    this.comunaProyecto = this.f['comunaId'].value;
    this.tipoZonaProyecto = this.f['tipoZonaId'].value;
    this.sectorProyecto = this.f['sector'].value;
    this.actividadProyecto = this.f['actividad'].value;
    this.tipoProyecto = this.f['tipo'].value;

    const project: any = {
      nombre: this.nombreProyecto,
      descripcion: this.descripcionProyecto,
      tipoProyectoId: type,
      sectorProductivoId: typeof this.sectorProyecto === 'string' ? 1/*this.sectorProyecto*/ : this.sectorProyecto.id,
      actividad: typeof this.actividadProyecto === 'string' ? this.actividadProyecto : this.actividadProyecto.name,
      tipo: this.tipoProyecto ? this.tipoProyecto : 'requisito'
    };

    this.showPreLoader();

    this.projectsService.update(this.proyecto_id, project).pipe().subscribe(
      (data: any) => {
        
        this.hidePreLoader();
        localStorage.setItem('toast', 'true');
        let proyecto: any = data.data;
        this._router.navigate(['/projects']);
    },
    (error: any) => {
      
      this.hidePreLoader();
      //this.error = error ? error : '';
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
    
   }

   // PreLoader
  showPreLoader() {
    var preloader = document.getElementById("preloader");
    if (preloader) {
        (document.getElementById("preloader") as HTMLElement).style.opacity = "0.8";
        (document.getElementById("preloader") as HTMLElement).style.visibility = "visible";
    }
  }

  // PreLoader
  hidePreLoader() {
    var preloader = document.getElementById("preloader");
    if (preloader) {
        (document.getElementById("preloader") as HTMLElement).style.opacity = "0";
        (document.getElementById("preloader") as HTMLElement).style.visibility = "hidden";
    }
  }

}
