import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';

// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

/**
 * Create Component
 */
export class CreateComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  typeCreate: boolean = false;
  createForm!: UntypedFormGroup;
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

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      //{ label: 'Requisitos legales' },
      { label: 'Proyectos' },
      { label: 'Crear Proyecto', active: true }
    ];

    this.createForm = this.formBuilder.group({
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
      if(params['type'] != ''){  
        this.tipo = params['type'];  
        this.createForm.controls['tipo'].setValue(params['type']);
      }
    });

    this.getTypes();
    this.getRegions();
    this.getZones();
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.createForm.controls; }

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

   regresar(){
    this.step = this.step - 1;
   }

   siguiente2(){
    this.step++;
   }

   siguiente(){
    // stop here if form is invalid
    if (this.createForm.invalid) {
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

    this.breadCrumbItems = [
      //{ label: 'Requisitos legales' },
      { label: 'Proyectos' },
      { label: 'Crear Proyecto' },
      { label: 'Tipo', active: true }
    ];
    this.typeCreate = true;
    this.step++;
   }

  toggleSelected(buttonNumber: number) {
    this.selected = buttonNumber;
  }
  
  toggleSelected2(fase: number) {
    if (this.selected === fase) {
      // Si se hace clic en el botón que ya está seleccionado, deseleccionarlo
      this.selected = 0;
    } else {
      // Si se hace clic en un botón diferente al que está seleccionado, cambiar el estado de selección
      this.selected = fase;
    }
  }

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

   saveProject(type: any){
    // stop here if form is invalid
    if (this.createForm.invalid) {
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
      //regionId: this.regionProyecto,
      //comunaId: this.comunaProyecto,
      //tipoZonaId: this.tipoZonaProyecto,
      sectorProductivoId: typeof this.sectorProyecto === 'string' ? 1/*this.sectorProyecto*/ : this.sectorProyecto.id,
      actividad: typeof this.actividadProyecto === 'string' ? this.actividadProyecto : this.actividadProyecto.name,
      tipo: this.tipoProyecto
    };

    this.showPreLoader();

    this.projectsService.create(project).pipe().subscribe(
      (data: any) => {
        
        let proyecto: any = data.data;
        //this.hidePreLoader();
        //localStorage.setItem('toast', 'true');
        //this._router.navigate(['/projects/'+proyecto.id+'/identification']);
        this.saveLocation(proyecto.id);
        //this._router.navigate(['/pages/'+proyecto.id+'/steps']);
        //this._router.navigate(['/projects']);
    },
    (error: any) => {
      
      this.hidePreLoader();
      //this.error = error ? error : '';
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
    
   }

   saveLocation(proyectoId?: any){
    const location: any = {        
      "regionId": this.f['regionId'].value,
      "comunaId": this.f['comunaId'].value,
      "tipoZonaId": this.f['tipoZonaId'].value,
      "proyectoId": proyectoId
    };

      this.projectsService.saveLocation(location).pipe().subscribe(
        (data: any) => {
            this.hidePreLoader();
            localStorage.setItem('toast', 'true');
            this._router.navigate(['/projects/'+proyectoId+'/identification']);
            
        },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
        this._router.navigate(['/projects/'+proyectoId+'/identification']);
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
