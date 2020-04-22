import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Group, Speciality, Faculty } from '../../shared/entity.interface';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalService } from '../../shared/services/modal.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { GroupModalService } from './group-modal.service';
import { DialogData } from './group-modal.interface';
import { GroupService } from './group.service';
import { GroupAddEditDialogComponent } from './group-add-edit-dialog/group-add-edit-dialog.component';
import { GroupViewDialogComponent } from './group-view-dialog/group-view-dialog.component';
import {  throwError, Observable, ReplaySubject,  } from 'rxjs';
import { Column, tableActionsType, ActionTable, PaginationEvent } from 'src/app/shared/mat-table/mat-table.interface';
import { Router } from '@angular/router';
import { Store, select,  } from '@ngrx/store';
import { AdminState } from '../store/MainReducer';
import { loadGroups, groupUpdate, groupDelete, groupCreate } from '../store/group/group-actions';
import {  readyGroup, selectTotalGroups, } from '../store/group/group-selectors';





@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, AfterViewInit {
  arrayVisitedPages = new Set();

  columns: Column[] = [
    { columnDef: 'group_id', header: 'ID' },
    { columnDef: 'group_name', header: 'Шифр групи' },
    { columnDef: 'speciality', header: 'Спеціальність' },
    { columnDef: 'faculty', header: 'Факультет' },
    {
      columnDef: 'action', header: 'Дії', actions: [
        // tslint:disable-next-line:max-line-length
        { type: tableActionsType.Route, icon: 'supervisor_account', matTooltip: 'Перейти до списку студентів', aria_label: 'supervisor_account', route: 'Students' },
        { type: tableActionsType.Route, icon: 'score', matTooltip: 'Перейти до результатів тестування', aria_label: 'score', route: 'results' },
        { type: tableActionsType.Edit, icon: 'edit', matTooltip: 'Редагувати', aria_label: 'edit' },
        { type: tableActionsType.Remove, icon: 'delete', matTooltip: 'Видалити', aria_label: 'delete' }
      ]
    }
  ];

  totalGroups$: Observable<number> = this.store.pipe(select(selectTotalGroups));
  groups$: Observable<any> = this.groupService.getGroups();

  listGroups = [];
  listSpeciality: Speciality[] = [];
  listFaculty: Faculty[] = [];
  dataSource = new MatTableDataSource<Group>();

  /** properties for pagination */
  itemsCount: number;
  pageSize = 10;
  offset = 0;
  currentPage = 0;
  /** properties for get group for features */
  isCheckSpeciality = false;
  isCheckFaculty = false;
  feature: string;
  total = 0;

  @ViewChild('table', { static: true }) table: MatTable<Group>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;



  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private modalService: ModalService,
    private snackBar: MatSnackBar,
    private groupModalService: GroupModalService,
    public groupService: GroupService,
    private route: Router,
    private store: Store<AdminState>
  ) {
  }

  ngOnInit() {
    this.getCountRecords('group');
    // this.groups$.subscribe((data) => {
    //   this.listGroups = data;
    //   console.log(this.listGroups);
    //  })
    this.getListGroups();
    // this.store.dispatch(loadGroups({
    //   pageSize: 10,
    //   offset: 0
    // }));
    this.totalGroups$.subscribe((totalGroups) => {
      this.total = totalGroups;
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getAction(action: ActionTable<Group>) {
    const actions = {
      edit: () => {
        this.openEditGroupDialog(action.body);
      },
      remove: () => {
        this.openConfirmDialog(action.body);
      },
      route: () => {
        this.route.navigate([`admin/group/${action.route}`, action.body.group_id]);
      },
      default() {
        throwError('Error');
      }
    };
    (actions[action.type] || actions.default)();
  }
  pageUpdate(event: PaginationEvent) {
    this.pageSize = event.pageSize;
    this.offset = event.offset;
    this.getListGroups(event.pageSize,event.offset,event.page);
  }

  /** Get part (size page) list of groups */
  getListGroups(pageSize: number = 10,offset: number = 0,page: number = 0) {
    let newpage = page === 0 ? 1 : page ;
    if (page=== 0) {
      newpage = 1;
    } else if(newpage === page) {
       newpage++;
    } else {
      newpage--;
    }
    console.log('Total: ',this.total,'ItemsCounts: ',this.itemsCount);
    if(![...this.arrayVisitedPages].includes(page) && !(this.total === this.itemsCount) || !(this.total === this.itemsCount)) {
      console.log('Im here');
      this.arrayVisitedPages.add(page);
      this.store.dispatch(loadGroups({
        pageSize,
        offset
      }));
    }


    // this.listGroups = this.groupService.chunkArray(this.listGroups,newpage,pageSize);
    // console.log(this.listGroups);
    // this.listFaculty = this.groupService.getListFaculty();
    // this.listSpeciality =  this.groupService.getListSpeciality();
    this.groupService.combineGroup(newpage,pageSize).subscribe((groups) => {
    console.log('How many times here');
     this.listGroups = groups;
     this.listFaculty = this.groupService.getListFaculty();
     this.listSpeciality =  this.groupService.getListSpeciality();
   });
  }

  /** Get length all list of groups */
  getCountRecords(entity: string) {
    this.apiService.getCountRecords(entity).subscribe(result => {
      this.itemsCount = result.numberOfRecords;
    });
  }

  /** Open modal window for add new group */
  openAddGroupDialog(): void {
    const dialogData = new DialogData();
    dialogData.listSpeciality = this.listSpeciality;
    dialogData.listFaculty = this.listFaculty;
    dialogData.description = {
      title: 'Додати нову групу',
      action: 'Додати'
    };
    this.groupModalService.groupDialog(GroupAddEditDialogComponent, dialogData, (group: Group) => this.addGroup(group));
  }

  /** Add new group */
  addGroup(group: Group) {
    this.apiService.createEntity('Group', group).subscribe(([result]) => {
      this.openSnackBar(`Групу ${group.group_name} успішно додано`);
      this.getCountRecords('group');
      // const numberOfPages = this.paginator.getNumberOfPages();
      // this.getListGroups(this.pageSize, this.offset);
      this.store.dispatch(groupCreate({create: result}));
    }, (error: any) => {
      if (error.error.response.includes('Duplicate')) {
        this.modalService.openErrorModal(`Група "${group.group_name}" вже існує`);
      }
    });
  }
  /** open modal window for confirm delete */
  openConfirmDialog(group: Group) {
    const message = `Підтвердіть видалення групи "${group.group_name}"`;
    this.modalService.openConfirmModal(message, () => this.delGroup(group));
  }

  /** Delete group */
  delGroup(group: Group) {
    this.apiService.delEntity('Group', group.group_id).subscribe((result: any) => {
      if (result) {
        this.store.dispatch(groupDelete({id: group.group_id}));
        this.openSnackBar(`Групу ${group.group_name} успішно виделено`);
        this.getCountRecords('group');
      }
    }, (error: any) => {
      if (error.error.response.includes('Cannot delete')) {
        this.modalService.openInfoModal('Неможливо видалити групу із студентами. Видаліть спочатку студентів даної групи');
      } else {
        this.modalService.openErrorModal('Помилка видалення');
      }
    });
  }

  /** Open modal window for edit group */
  openEditGroupDialog(group: Group): void {
    const dialogData = new DialogData();
    dialogData.group = group;
    dialogData.listSpeciality = this.listSpeciality;
    dialogData.listFaculty = this.listFaculty;
    dialogData.description = {
      title: 'Редагувати інформацію про групу',
      action: 'Зберегти зміни'
    };
    this.groupModalService.groupDialog(GroupAddEditDialogComponent, dialogData, (elem: Group) =>
      this.editGroup(elem));
  }

  /** Method for edit group */
  editGroup(group: Group): void {
    this.store.dispatch(groupUpdate({
      update: {
        id: group.group_id,
        changes: group
      }
    }))
  }

  /** Open modal window for check speciality */
  openCheckSpecialityDialog() {
    const dialogData = new DialogData();
    // dialogData.listSpeciality = this.listSpeciality;
    dialogData.description = {
      title: 'Виберіть спеціальність',
      action: 'getGroupsBySpeciality'
    };
    this.groupModalService.groupDialog(GroupViewDialogComponent, dialogData,
      (result) => {
        this.getListGroupsByFeature(dialogData.description.action, result.id[0]);
        this.isCheckFaculty = false;
        this.isCheckSpeciality = true;
        this.feature = result.id[1];
      });
  }

  /** open modal window for check faculty */
  openCheckFacultyDialog() {
    const dialogData = new DialogData();
    // dialogData.listFaculty = this.store();
    dialogData.description = {
      title: 'Виберіть факультет/інститут',
      action: 'getGroupsByFaculty'
    };
    this.groupModalService.groupDialog(GroupViewDialogComponent, dialogData,
      (result) => {
        this.getListGroupsByFeature(dialogData.description.action, result.id[0]);
        this.isCheckFaculty = true;
        this.isCheckSpeciality = false;
        this.feature = result.id[1];
      });
  }

  /** Get list groups by speciality or faculty */
  getListGroupsByFeature(action: string, id: number): void {
    this.apiService.getEntityByAction('Group', action, id).subscribe((result: any) => {
      if ('response' in result) {
        this.listGroups = [];
        this.modalService.openInfoModal('Групи відсутні');
      } else {
        this.listGroups = this.groupService.addPropertyToGroup(result, this.listSpeciality, this.listFaculty);
      }
      this.currentPage = 0;
    }, () => {
      this.modalService.openErrorModal('Неможливо відобразити дані');
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
    });
  }

  backToListGroup() {
    this.currentPage = 0;
    this.isCheckFaculty = false;
    this.isCheckSpeciality = false;
    this.store.select(readyGroup).subscribe(data => this.listGroups = data);
  }
}
