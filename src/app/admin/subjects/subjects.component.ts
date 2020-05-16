import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { SubjectsCreateModalComponent } from './subjects-create-modal/subjects-create-modal.component';
import { Subject as SubjectInterface }  from 'src/app/admin/entity.interface';
import { mergeMap, filter, concatMap, tap, take, first, takeUntil } from 'rxjs/operators';
import { of, throwError, Observable, Subject, BehaviorSubject,} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/shared/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { AdminState } from '../store/MainReducer';
import { Store, select } from '@ngrx/store';
import { Column, tableActionsType, ActionTable } from 'src/app/shared/mat-table/mat-table.interface';
import { areSubjectsLoaded, selectAllSubject } from '../store/subject/subject-selectors';
import { loadSubjects, subjectCreate, subjectUpdate, subjectDelete } from '../store/subject/subject-actions';


@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['subject_number', /*'subject_id',*/ 'subject_name', 'subject_description', 'subject_menu'];
  public dataSource = new MatTableDataSource<SubjectInterface>();
  subjects$: Observable<SubjectInterface[]>;
  private unsubscribe = new Subject<void>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  columns: Column[] = [
    { columnDef: 'subject_id', header: 'ID' },
    { columnDef: 'subject_name', header: 'Предмет' },
    { columnDef: 'subject_description', header: 'Опис' },
    {
      columnDef: 'action', header: 'Дії', actions: [
        // tslint:disable-next-line:max-line-length
        { type: tableActionsType.Route, icon: 'assignment_turned_in', matTooltip: 'Тести предмета', aria_label: 'assignment_turned_in', route: 'tests' },
        // tslint:disable-next-line:max-line-length
        { type: tableActionsType.Route, icon: 'date_range', matTooltip: 'Розклад тестування', aria_label: 'date_range', route: 'timetable' },
        { type: tableActionsType.Edit, icon: 'edit', matTooltip: 'Редагувати', aria_label: 'edit' },
        { type: tableActionsType.Remove, icon: 'delete', matTooltip: 'Видалити', aria_label: 'delete' }
      ]
    }
  ];
  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private route: Router,
    private modalService: ModalService,
    private translate: TranslateService,
    private store: Store<AdminState>,
    private router: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // this.showSubjects().pipe(takeUntil(this.unsubscribe)).subscribe();
    this.subjects$ = this.store.pipe(select(selectAllSubject))
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.router.data.subscribe((data) => console.log(data))
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
   }

  showSubjects() {
    return this.store.pipe(
      select(areSubjectsLoaded),
      tap((hasLoaded) => {
        if (!hasLoaded) {
          this.store.dispatch(loadSubjects())
        }
      }),
      first((hasLoaded) => hasLoaded))
  }
  getAction(action: ActionTable<SubjectInterface>) {
    const { body: { subject_id }, body } = action;
    const actions = {
      edit: () => {
        this.edit(body);
      },
      remove: () => {
        this.openDialog(body);
      },
      route: () => {
        this.route.navigate([`${action.route}`,action.body.subject_id], { relativeTo: this.router.parent });
      },
      default() {
        throwError('Error');
      }
    };
    (actions[action.type] || actions.default)();
  }
  pageUpdate(ev) { }

  openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  translateSnackBar(json: string, action?: string) {
    this.openSnackBar(this.translate.instant(json), 'X');
  }

  createNewSubject() {
    const newDialogSubject = this.dialog.open(SubjectsCreateModalComponent, {
      width: '530px',
    });
    newDialogSubject.afterClosed()
      .pipe(
        mergeMap((data) => {
          if (data) {
            return this.apiService.createEntity('Subject', data);
          }
          return of(null);
        })
      )
      .subscribe((newData: SubjectInterface | null) => {
        if (newData) {
          this.store.dispatch(subjectCreate({create: newData[0]}))
          // this.dataSource.data = [...this.dataSource.data, newData[0]];
          this.modalService.openSnackBar('Предмет успішно додано','success');
        }
      },
      err => {
        if (err.error.response.includes('Duplicate')) {
          this.modalService.openErrorModal(`Такий предмет уже існує`);
        }
      });
  }

  edit(row: SubjectInterface): void {
    const newDialogSubject = this.dialog.open(SubjectsCreateModalComponent, {
      width: '530px',
      data: row,
    });
    newDialogSubject.afterClosed()
      .pipe(
        mergeMap((data) => {
          if (data) {
            return this.apiService.updEntity('subject', data, row.subject_id);
          }
          return of(null);
        })
      )
      .subscribe((newData: SubjectInterface[] | null) => {
        const [subject] = newData;
        const {subject_id, ...body} = subject;
        if (newData) {
          this.store.dispatch(subjectUpdate({
            update: {
              id: subject_id,
              changes: body
            }
          }))
          this.modalService.openSnackBar('Предмет успішно оновлено','success');
        }
      });
  }

  openDialog(subject: SubjectInterface) {
    const firstPart = this.translate.instant('subjects.deleteMessagesConfirmation');
    const message = firstPart + subject.subject_name + `' ?`;
    this.modalService.openConfirmModal(message, () => this.delSubject(subject.subject_id));
  }

  delSubject(id: number) {
    this.apiService.delEntity('Subject', id)
      .subscribe((response) => {
        this.store.dispatch(subjectDelete({id}));
        this.modalService.openSnackBar('Предмет успішно видалено','success');
      },
      () => this.modalService.openInfoModal('Неможливо видалити предмет. Через залежності в інших таблицях'))
  }

  navigateToTimeTable(subjectId) {
    this.route.navigate(['admin/subjects/timetable'], { queryParams: { id: subjectId } });
  }

  navigateToTests(subjectId) {
    this.route.navigate(['admin/subjects/tests'], { queryParams: { subject_id: subjectId } });
  }
}
