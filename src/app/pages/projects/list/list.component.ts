import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { projectListWidgets, projectListWidgets1, projectListWidgets2 } from './data';
import { projectListModel, projectListModel1, projectListModel2 } from './list.model';
import { listService } from './list.service';
import { DecimalPipe } from '@angular/common';
import { NgxXmlToJsonService } from 'ngx-xml-to-json';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [listService, DecimalPipe]
})

/**
 * List Component
 */
export class ListComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  projectListWidgets!: projectListModel[];
  projectListWidgets1!: projectListModel1[];
  projectListWidgets2!: projectListModel2[];
  projectmodel!: Observable<projectListModel2[]>;
  total: Observable<number>;
  sellers?: any;
  xml= `<contact-info><address category = "Profile" type = "Address" ><name color='white'><![CDATA[ Welcome to XML Converter]]>XML Parser</name><company>OpenSource</company><phone>(011) 123-4567</phone></address><address/><personal category = "Name"> XML Parser</personal></contact-info>`;
  

  constructor(private modalService: NgbModal,
    public service: listService, private ngxXmlToJsonService: NgxXmlToJsonService) {
    this.projectmodel = service.companies$;
    this.total = service.total$;
    const options = { // set up the default options 
      textKey: 'text', // tag name for text nodes
      attrKey: 'attr', // tag for attr groups
      cdataKey: 'cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
    };
    const jsonObj = this.ngxXmlToJsonService.xmlToJson(this.xml, options);
    console.log('json:',jsonObj);
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyectos' },
      { label: 'Lista de Proyectos', active: true }
    ];

    /**
     * Fetches the data
     */
    this.fetchData();
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    // this.projectListWidgets = projectListWidgets;
    this.projectListWidgets1 = projectListWidgets1;
    this.projectListWidgets2 = projectListWidgets2;
    setTimeout(() => {
      this.projectmodel.subscribe(x => {
        this.projectListWidgets = Object.assign([], x);
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }, 1200);
  }

  /**
  * Confirmation mail model
  */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    document.getElementById('pl1_' + id)?.remove();
  }

  /**
   * Active Toggle navbar
   */
  activeMenu(id: any) {
    document.querySelector('.heart_icon_' + id)?.classList.toggle('active');
  }

}
