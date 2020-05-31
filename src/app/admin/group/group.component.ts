import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject, throwError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActionTable, Column, PaginationEvent, tableActionsType } from 'src/app/shared/mat-table/mat-table.interface';
import { ApiService } from 'src/app/shared/services/api.service';
import { Faculty, Group, Speciality } from '../../shared/entity.interface';
import { ModalService } from '../../shared/services/modal.service';
import { selectAllFaculties } from '../store/faculty/faculty-selectors';
import { groupCreate, groupDelete, groupUpdate, loadGroups } from '../store/group/group-actions';
import { selectTotalGroups } from '../store/group/group-selectors';
import { AdminState } from '../store/MainReducer';
import { selectAllSpecialities } from '../store/speciality/speciality-selectors';
import { GroupAddEditDialogComponent } from './group-add-edit-dialog/group-add-edit-dialog.component';
import { DialogData } from './group-modal.interface';
import { GroupModalService } from './group-modal.service';
import { GroupViewDialogComponent } from './group-view-dialog/group-view-dialog.component';
import { GroupService } from './group.service';



@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, AfterViewInit, OnDestroy {
  arrayVisitedPages = new Set();
  visitedOffsets = new Set();
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
  private unsubscribe = new Subject<void>();
  listGroups = [];
  listGroupsChunk = [];
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
    this.getListEntities();
    this.getCountRecords('group');
    this.visitedOffsets.add(this.validatePage(this.currentPage) * this.pageSize);
    this.arrayVisitedPages.add(this.currentPage);
    this.dispatchGroups();
    this.groupService.getGroups()
      .pipe(
        takeUntil(this.unsubscribe)
      ).subscribe((data) => {
        this.listGroups = data;
        this.listGroupsChunk = [...this.chunkArray(this.listGroups, this.currentPage, this.pageSize)];
      })

    this.totalGroups$.subscribe((totalGroups) => this.total = totalGroups);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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
    this.currentPage = event.page;
    if (this.checkVisitedOffset(this.validatePage(event.page) * event.pageSize, event.page)) {
      this.arrayVisitedPages.add(event.page);
      this.visitedOffsets.add(this.validatePage(event.page) * event.pageSize);
      this.dispatchGroups(event.pageSize, event.offset);
    } else {
      this.listGroupsChunk = [...this.chunkArray(this.listGroups, event.page, event.pageSize)];
    }
  }


  /** Get length all list of groups */
  getCountRecords(entity: string) {
    this.apiService.getCountRecords(entity).subscribe(result => {
      this.itemsCount = result.numberOfRecords;
    });
  }
  checkVisitedOffset(offset: number, page: number) {
    return (![...this.visitedOffsets].includes(offset) && !(this.total === this.itemsCount) && ![...this.arrayVisitedPages].includes(page))
  }
  checkVisitedPages(page: number, pageSize?: number) {
    return (![...this.arrayVisitedPages].includes(page) && !(this.total === this.itemsCount))
  }
  dispatchGroups(pageSize: number = 10, offset: number = 0): void {
    this.store.dispatch(loadGroups({
      pageSize,
      offset
    }));
  }

  validatePage(page: number) {
    let newpage = page === 0 ? 1 : page;
    if (page === 0) {
      newpage = 1;
    } else if (newpage === page) {
      newpage += 1
    } else {
      newpage -= 1;
    }
    return newpage
  }
  chunkArray(groups: Group[], page: number, pageSize: number) {
    return this.groupService.chunkArray(groups, this.validatePage(page), pageSize);
  }

  getListEntities() {
    combineLatest(
      this.store.select(selectAllFaculties),
      this.store.select(selectAllSpecialities),
      (faculty, speciality) => [faculty, speciality]
    ).subscribe(([faculty, speciality]: [[], []]) => {
      this.listSpeciality = speciality;
      this.listFaculty = faculty;
    })
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
      this.modalService.openSnackBar(`Групу ${group.group_name} успішно додано`,'success');
      this.getCountRecords('group');
      this.store.dispatch(groupCreate({ create: result }));
    }, (error: any) => {
      if (error.error.response.includes('Duplicate')) {
        this.modalService.openErrorModal(`Група "${group.group_name}" вже існує`);
      }
      if (error.error.response.includes('Data too long')) {
        this.modalService.openErrorModal(`Занадто велике імя для групи`);
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
        this.store.dispatch(groupDelete({ id: group.group_id }));
        this.modalService.openSnackBar(`Групу ${group.group_name} успішно виделено`,'success');
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
        this.listGroupsChunk = [];
        this.modalService.openInfoModal('Групи відсутні');
      } else {
        this.listGroupsChunk = this.groupService.addPropertyToGroup(result, this.listSpeciality, this.listFaculty);
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
    this.listGroupsChunk = this.chunkArray(this.listGroups, this.currentPage, this.pageSize);
  }
}
