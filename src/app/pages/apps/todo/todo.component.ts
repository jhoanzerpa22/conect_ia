import { Component, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, UntypedFormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTable } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Drag and drop
import { DndDropEvent } from 'ngx-drag-drop';

import { Todo, Assigned, project } from './todo.model';
import { todoList, AssignedData, projectList } from './data';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})

/**
 * Todo Component
 */
export class TodoComponent {

  public velzonAdmin = false;
  public projectCollapsed = true;
  public skoteCollapsed = true;
  public ecommerceCollapsed = true;
  unassignedTasks!: Task[];
  todoList!: Todo[];
  submitted = false;
  ListJsDatas: any;
  todoForm!: UntypedFormGroup;
  AssignedData!: Assigned[];
  projectList!: project[];
  term: any;
  todoDatas: any;

  // Project Section
  projectForm!: UntypedFormGroup;

  constructor(private modalService: NgbModal, private formBuilder: UntypedFormBuilder) {
  }

  @ViewChild('dataTable')
  table!: MatTable<Todo>;
  displayedColumns: string[] = ['task', 'subItem', 'dueDate', 'status', 'priority', 'action'];
  dataSource = todoList;

  ngOnInit(): void {
    /**
     * Form Validation
     */
    this.todoForm = this.formBuilder.group({
      ids: [''],
      task: ['', [Validators.required]],
      status: ['New', [Validators.required]],
      priority: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      subItem: ['', [Validators.required]],
    });

    this.AssignedData = AssignedData;
    // Project Data
    this.projectList = Object.assign([], projectList);
    this.todoDatas = this.dataSource

    /**
     * Recent Validation
    */
    this.projectForm = this.formBuilder.group({
      ids: [''],
      title: ['', [Validators.required]]
    });

    // Compose Model Hide/Show
    var isShowMenu = false;
    document.querySelectorAll(".file-menu-btn").forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        isShowMenu = true;
        document.getElementById('menusidebar')?.classList.add("menubar-show");
      });
    });
    document.querySelector('.chat-wrapper')?.addEventListener('click', function () {
      if (document.querySelector(".file-manager-sidebar")?.classList.contains('menubar-show')) {
        if (!isShowMenu) {
          document.querySelector(".file-manager-sidebar")?.classList.remove("menubar-show");
        }
        isShowMenu = false;
      }
    });

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

  // Todo Drag and droup data
  todoTable(event: CdkDragDrop<Todo[]>): void {
    moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  /**
  * Delete Model Open
  */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    document.getElementById('row-' + id)?.remove();
  }

  /**
   * Open modal
   * @param content modal content
  */
  openModal(content: any) {
    this.submitted = false;
    this.todoForm.reset();
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form() {
    return this.todoForm.controls;
  }

  /**
  * Save Todo data
  */
  saveTodo() {
    if (this.todoForm.valid) {
      if (this.todoForm.get('ids')?.value) {
        this.todoDatas = this.todoDatas.map((data: { id: any; }) => data.id === this.todoForm.get('ids')?.value ? { ...data, ...this.todoForm.value } : data);
        this.modalService.dismissAll();
      } else {
        const id = "17";
        const task = this.todoForm.get('task')?.value;
        const dueDate = this.todoForm.get('dueDate')?.value;
        const status = this.todoForm.get('status')?.value;
        const priority = this.todoForm.get('priority')?.value;
        var subItem = this.todoForm.get('subItem')?.value;
        this.todoDatas.push({
          id,
          task,
          dueDate,
          status,
          priority,
          subItem
        });
        this.modalService.dismissAll();
      }
    }
    setTimeout(() => {
      this.todoForm.reset();
    }, 2000);
    this.submitted = true
  }

  /**
   * Open modal
   * @param content modal content
   */
  editModal(content: any, id: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
    var listData = this.dataSource.filter((data: { id: any; }) => data.id === id);
    this.todoForm.controls['task'].setValue(listData[0].task);
    this.todoForm.controls['dueDate'].setValue(listData[0].dueDate);
    this.todoForm.controls['status'].setValue(listData[0].status);
    this.todoForm.controls['priority'].setValue(listData[0].priority);
    this.todoForm.controls['subItem'].setValue(listData[0].subItem);
    this.todoForm.controls['ids'].setValue(listData[0].id);
  }

  // Location Filter
  taskFilter() {
    var status = (document.getElementById("choices-select-status") as HTMLInputElement).value;
    if (status) {
      this.todoDatas = this.dataSource.filter((data: any) => {
        return data.status === status;
      });
    }
    else {
      this.todoDatas = this.dataSource
    }
  }

  // Sort filter
  sortField: any;
  sortBy: any
  SortFilter() {
    this.sortField = (document.getElementById("choices-select-sortlist") as HTMLInputElement).value;
    if (this.sortField[0] == 'A') {
      this.sortBy = 'desc';
      this.sortField = this.sortField.replace(/A/g, '')
    }
    if (this.sortField[0] == 'D') {
      this.sortBy = 'asc';
      this.sortField = this.sortField.replace(/D/g, '')
    }
  }

  // Checked Selected
  checkUncheckAll(e: any, id: any) {
    var checkboxes: any = e.target.closest('tr').querySelector('#todo' + id);
    var status: any = e.target.closest('tr').querySelector('.status');
    if (checkboxes.checked) {
      status.innerHTML = '<span class="badge text-uppercase badge-soft-success">Completed</span>'
    }
    else {
      status.innerHTML = '<span class="badge text-uppercase badge-soft-secondary">Inprogress</span>'
    }
  }

  //====== Project Section ======//
  /**
   * Open Project modal
   * @param projectcontent modal content
   */
  openProjectModal(projectcontent: any) {
    this.submitted = false;
    this.modalService.open(projectcontent, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get projectform() {
    return this.projectForm.controls;
  }

  /**
  * Save user
  */
  saveRecent() {
    if (this.projectForm.valid) {
      const id = "4";
      const title = this.projectForm.get('title')?.value;
      const coll = "newCollapsed";
      const subItem = [
        {
          version: 'v1.0.0',
          color: 'danger'
        }
      ];
      this.projectList.push({
        id,
        title,
        coll,
        subItem
      });
      this.modalService.dismissAll();
    }
    setTimeout(() => {
      this.projectForm.reset();
    }, 2000);
    this.submitted = true
  }


}
