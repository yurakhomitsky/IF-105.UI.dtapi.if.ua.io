import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { StudentInfo, TestsForStudent } from '../../shared/entity.interface';
import { Router } from '@angular/router';
import { Test } from '../../admin/entity.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ModalService } from '../../shared/services/modal.service';
import { SessionStorageService } from 'angular-web-storage';
import { StudentInfoService } from '../student-info.service';
import { defaultImage } from '../../shared/default-image/default-image';
import { TestPlayerService } from '../test-player.service';
import { ErrorResponse } from '../student.errors.response';
import { Store, select } from '@ngrx/store';
import { StudentState } from '../store/mainReducer';
import { loadTimeTable } from '../store/studentTimeTable/studentTimeTable.actions';
import { find, filter, tap, takeUntil } from 'rxjs/operators';
import { selectTimeTableAndUserInfo, areTimeTableLoaded } from '../store/studentTimeTable/studentTimeTable.selectors';
import { areDataLoaded } from 'src/app/admin/store/store-operators';
import { UnSubscribeService } from 'src/app/shared/services/unsubsrice.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-student-info',
  templateUrl: './student-info.component.html',
  styleUrls: ['./student-info.component.scss']
})
export class StudentInfoComponent implements OnInit, OnDestroy {
  unsubscribe$: Observable<any>;
  dataSource = new MatTableDataSource<TestsForStudent>();
  displayedColumns: string[] = [
    'subject',
    'test',
    'start',
    'end',
    'tasks',
    'duration',
    'attempts',
    'actions'
  ];

  @ViewChild('table') table: MatTable<Element>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private modalService: ModalService,
    public session: SessionStorageService,
    private testPlayerService: TestPlayerService,
    private store: Store<StudentState>,
    private unSubscribeService: UnSubscribeService
  ) {
  }

  studentInfo: StudentInfo;
  currDate: Date;
  testInProgress: boolean;

  ngOnInit() {
    this.unsubscribe$ = this.unSubscribeService.unsubscribeP;
    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(selectTimeTableAndUserInfo),
      filter(Boolean))
      .subscribe(({ _, timeTable }) => {
        this.dataSource.data = timeTable;
        this.dataSource.paginator = this.paginator;
      });
  }
  ngOnDestroy() {
    this.unSubscribeService.unSubscribe();
  }

  public goToTest(tableEl: TestsForStudent) {
    this.testPlayerService.getLog(tableEl.test_id)
      .subscribe(() => {
        if (tableEl.can_be_start) {
          this.session.set('testInProgress', true);
          this.router.navigate(['student/test-player'], {
            queryParams: {
              id: tableEl.test_id,
            }
          });
        } else {
          this.modalService.openAlertModal('Тест ще не доступний для проходження на даний момент', '', '');
        }
      },
        ({ error }) => {
          this.modalService.openAlertModal(ErrorResponse[error.response], 'Помилка', 'info');
        })
   }

}
