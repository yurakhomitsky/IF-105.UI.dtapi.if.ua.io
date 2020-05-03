import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import { Subject } from '../../entity.interface';
import { Test } from 'src/app/shared/entity.interface';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TestAddComponent } from '../add/test-add.component';
import { ModalService } from '../../../shared/services/modal.service';
import { ApiService } from '../../../shared/services/api.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ExportService } from '../../../shared/services/export.service';
import { ExportImportComponent } from '../export-import/export-import.component';
import { Store, select } from '@ngrx/store';
import { AdminState } from '../../store/MainReducer';
import { loadTests, testCreate, testUpdate, testDelete } from '../../store/tests/tests-actions';
import { selectAllTests, selectLoadedTestSubject } from '../../store/tests/tests-selectors';
import { tap, switchMap, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { selectAllSubject } from '../../store/subject/subject-selectors';


@Component({
  selector: 'app-test',
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.scss'],
})
export class TestListComponent implements OnInit {
  currentSubjectId: number;
  listTests: Test[] = [];
  listSubjects: Subject[] = [];
  visitedSubjects: number [] = [];
  dataSource = new MatTableDataSource<Test>();
  displayedColumns: string[] = [
    'id',
    'name',
    'subject',
    'tasks',
    'action',
  ];

  @ViewChild('table', {static: true}) table: MatTable<Test>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    protected apiService: ApiService,
    private modalService: ModalService,
    public route: ActivatedRoute,
    private router: Router,
    private exportService: ExportService,
    private store: Store<AdminState>
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap((params: Params) => {
        this.currentSubjectId = +params.id;
      }),
      switchMap(() => this.fetchTests())
    ).
    subscribe((tests) => {
      this.listTests = tests;
      this.dataSource.data = this.listTests;
      this.dataSource.paginator = this.paginator;
    });
    this.store.pipe(select(selectAllSubject)).subscribe((subjects) => {
      this.listSubjects = subjects
    });
  }
  fetchTests() {
   return this.store.pipe(
      select(selectLoadedTestSubject),
      tap((subjecIds) => {
        if (!subjecIds.includes(this.currentSubjectId))
        this.store.dispatch(loadTests({subjectId: +this.currentSubjectId}))
      }),
      switchMap(() => this.store.select(selectAllTests)),
      filter((tests) => tests.length > 0),
      map((tests) => tests.filter((test) => +test.subject_id === +this.currentSubjectId)),
      distinctUntilChanged(),
    )
  }

  onChangeSubject(newSubjectId: number) {
    this.listTests = [];
    this.currentSubjectId = newSubjectId;
    this.router.navigate(['../../','tests',this.currentSubjectId], { relativeTo: this.route.parent });
    // this.router.navigate([], {queryParams: {subject_id: this.currentSubjectId}});
  }

  public openAddTestDialog(): void {
    const dialogRef = this.dialog.open(TestAddComponent, {
      width: '500px',
      data: {
        data: this.currentSubjectId ? {subject_id: this.currentSubjectId.toString()} : {},
        description: {
          title: 'Додати новий тест',
          action: 'Додати'
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addTest(this.prepareTestData(result));
      }
    });
  }

  private prepareTestData(data: Test): Test {
    if (!data.enabled) {
      data.enabled = '0';
    }
    return data;
  }

  public openDeleteDialog(test: Test) {
    const message = `Підтвердіть видалення теста ${test.test_name}?`;

    this.modalService.openConfirmModal(message, () => this.removeTest(test.test_id));
  }

  public openEditTestDialog(test: Test): void {
    const dialogRef = this.dialog.open(TestAddComponent, {
      width: '500px',
      data: {
        data: {...test},
        description: {
          title: 'Редагувати інформацію про тест',
          action: 'Зберегти зміни'
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editTest(this.prepareTestData(result));
      }
    });
  }

  public getSubjectNameById(subjectId: string): string {
    const subject = this.listSubjects.find(subjectItem => {
      return +subjectItem.subject_id === +subjectId;
    });
    if (subject) {
      return subject.subject_name;
    }

    return 'Невизначений';
  }

  private addTest(test: Test) {
    this.apiService.createEntity('test', test).subscribe((result: Test[]) => {
      this.store.dispatch(testCreate({create: result[0]}))
      this.table.renderRows();
      this.dataSource.paginator = this.paginator;
    });
  }

  private editTest(test: Test): void {
    console.log(test);
    this.apiService.updEntity('test', test, test.test_id).subscribe((data) => {
      this.store.dispatch(testUpdate({update: {
        id: test.test_id,
        changes: test
      }}))
      // this.dataSource.data = this.listTests;
    }, (error: any) => {
      if (error.error.response.includes('Error when update')) {
        this.modalService.openErrorModal('Дані не оновлювалися');
      } else {
        this.modalService.openErrorModal('Помилка оновлення!');
      }
    });
  }

  private removeTest(id: number) {
    this.apiService.delEntity('test', id)
      .subscribe((response) => {
        this.store.dispatch(testDelete({id}))
          this.modalService.openInfoModal('Тест видалено');
        },
        err => {
          this.modalService.openErrorModal('Помилка видалення');
        });
  }


  public navigateToTestDetail(testId: number) {
    this.router.navigate(['/admin/subjects/tests/test-detail'], { queryParams: { test_id: testId }});
  }

  /** Create modal window for checked levelsfoe export test */
  createSelectLevelTestModal(test_id: number, level: number[]): void {
    const dialogRef = this.dialog.open(ExportImportComponent, {
      width: '500px',
      data: {
        level,
        test_id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exportService.loadQuestionsByTest(result.test_id, result.level);
      }
    });
  }
  openModal(test_id: number) {
    this.exportService.getLevelsByTest(test_id).subscribe((listLevels) => {
      //if (listLevels) {
        this.createSelectLevelTestModal(test_id, listLevels);
      //} else {
      //  this.modalService.openErrorModal('В даному тесті відсутні запитання');
      //}
    });
  }
}
