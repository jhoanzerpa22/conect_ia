import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// Drag and drop
import { DndDropEvent } from 'ngx-drag-drop';
import { Observable } from 'rxjs';
// Sweet Alert
import Swal from 'sweetalert2';

import { tasks } from './data';
import { Task } from './kanban.model';
import { kanbanService } from './kanban.service';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
  providers: [kanbanService, DecimalPipe]
})

/**
 * Kanban Component
 */
export class KanbanComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  unassignedTasks!: Task[];
  todoTasks!: Task[];
  inprogressTasks!: Task[];
  reviewsTasks!: Task[];
  completedTasks!: Task[];
  newTasks!: Task[];
  TaskList!: Observable<Task[]>;
  total: Observable<number>;
  alltask?: any;

  constructor(private modalService: NgbModal,
    public service: kanbanService) {
    this.TaskList = service.companies$;
    this.total = service.total$
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Tasks' },
      { label: 'Kanban Board', active: true }
    ];

    /**
     * Data Get Function
     */
    this._fetchData();
  }

  /**
   * on dragging task
   * @param item item dragged
   * @param list list from item dragged
   */
  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
    list.splice(index, 1);
  }


  /**
   * On task drop event
   */
  onDrop(event: DndDropEvent, filteredList?: any[], targetStatus?: string) {
    if (filteredList && event.dropEffect === 'move') {
      let index = event.index;

      if (typeof index === 'undefined') {
        index = filteredList.length;
      }

      filteredList.splice(index, 0, event.data);
    }
  }

  /**
   * Data Fetch
   */
  private _fetchData() {
    // all tasks

    setTimeout(() => {
      this.TaskList.subscribe(x => {
        this.alltask = Object.assign([], x);
        this.unassignedTasks = this.alltask.filter((t: any) => t.status === 'Unassigned');
        this.todoTasks = this.alltask.filter((t: any) => t.status === 'todo');
        this.inprogressTasks = this.alltask.filter((t: any) => t.status === 'inprogress');
        this.reviewsTasks = this.alltask.filter((t: any) => t.status === 'reviews');
        this.completedTasks = this.alltask.filter((t: any) => t.status === 'completed');
        this.newTasks = this.alltask.filter((t: any) => t.status === 'new');
      });
      document.querySelectorAll('#add-btn')?.forEach((iteam: any) => {
        iteam.classList.remove('d-none')
      })
      document.getElementById('elmLoader')?.classList.add('d-none')
    }, 1200);
  }

  /**
  * Open modal
  * @param content modal content
  */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
 * Open modal
 * @param content modal content
 */
  openMemberModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
 * Open modal
 * @param content modal content
 */
  openAddModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
* Confirmation mail model
*/
  confirm() {
    Swal.fire({
      title: 'Are you sure ?',
      text: 'Are you sure you want to remove this tasks ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Close'
    }).then(result => {
      if (result.value) {
        Swal.fire('Deleted!', 'Task has been deleted.', 'success');
      }
    });
  }

}
