import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ModalService } from '../../shared/services/modal.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { ResponseInterface } from 'src/app/shared/entity.interface';

import { StudentsModalWindowComponent } from './students-modal-window/students-modal-window.component';
import { TransferStudentModalWindowComponent } from './transfer-student-modal-window/transfer-student-modal-window.component';
import { ViewStudentModalWindowComponent } from './view-student-modal-window/view-student-modal-window.component';

import { Student } from 'src/app/shared/entity.interface';
import { AppState } from 'src/app/reducers';
import { Store, select } from '@ngrx/store';
import { loadStudents, studentDelete } from '../store/student/student-actions';
import { selectLoadedStudentsGroup, selectAllStudents, selectLoadingStudents } from '../store/student/student.selectors';
import { tap, concatMap, map,  distinctUntilChanged, takeUntil, finalize } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { checkIdsLoaded } from '../store/store-operators';
import { UnSubscribeService } from 'src/app/shared/services/unsubsrice.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent implements OnInit, AfterViewInit, OnDestroy {

  public updateData: boolean;
  public submitButtonText: string;
  public groupdID: number;
  students: Student[] = [];
  public displayedColumns: string[] = ['numeration', 'gradebookID', 'studentNSF', 'UpdateDelete'];
  public dataSource = new MatTableDataSource<Student>();
  students$: Observable<Student[]>;;
  private unsubscribe: Observable<void>;
  @ViewChild('table') table: MatTable<Element>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  public isLoading = this.store.select(selectLoadingStudents);
  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private matSnackBar: MatSnackBar,
    private store: Store<AppState>,
    private unSubscribeService: UnSubscribeService
  ) { }

  ngOnInit() {
    this.unsubscribe = this.unSubscribeService.unsubscribeP;
    this.groupdID = this.activatedRoute.snapshot.params['id'];
    this.fetchStudents()
      .pipe(
        takeUntil(this.unsubscribe)
      ).subscribe((students) => {
        this.showStudentsByGroup(students);
      })
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy(): void {
    this.unSubscribeService.unSubscribe();
  }
  fetchStudents() {
    return this.store.select(selectLoadedStudentsGroup).pipe(
      checkIdsLoaded<Student>({
        id: +this.groupdID,
        dispatch: () =>  this.store.dispatch(loadStudents({ idGroup: this.groupdID })),
        select: () => this.store.select(selectAllStudents)
      }),
      map((students) => students.filter((student) => +student.group_id === +this.groupdID)),
      distinctUntilChanged(),
    )
  }

  showStudentsByGroup(students: Student[]) {
    // this.dataSource = new MatTableDataSource<Student>();
    if (students.length === 0) {
      this.dataSource.data = [];
    // this.areLoading = false
    } else {
      this.dataSource.data = students;
     // this.areLoading = false
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  addStudent() {
    this.submitButtonText = 'Додати студента';
    this.updateData = false;
    this.showModalWindow(this.submitButtonText, this.updateData).afterClosed().subscribe((response) => {
      if (!response) {
        return this.showSnackBar('НЕМАЄ ВІДПОВІДІ ВІД СЕРВЕРУ. МОЖЛИВІ ПРОБЛЕМИ З ПІДКЛЮЧЕННЯМ АБО СЕРВЕРОМ');
      } else if (response.response === 'ok') {
        // this.showStudentsByGroup();
        return this.showSnackBar('Студент доданий, дані збережено');
      } else if (response === 'Canceled') {
        return this.showSnackBar('Скасовано');
      }
    });
  }

  editStudent(student: Student) {
    this.submitButtonText = 'Змінити дані студента';
    this.updateData = true;
    this.showModalWindow(this.submitButtonText, this.updateData, student)
      .afterClosed().subscribe((response) => {
        if (!response) {
          return this.showSnackBar('НЕМАЄ ВІДПОВІДІ ВІД СЕРВЕРУ. МОЖЛИВІ ПРОБЛЕМИ З ПІДКЛЮЧЕННЯМ АБО СЕРВЕРОМ');
        } else if (response.response === 'ok') {
          // this.showStudentsByGroup();
          return this.showSnackBar('Дані студента змінено та збережено');
        } else if (response === 'Canceled') {
          return this.showSnackBar('Скасовано');
        }
      });
  }

  deleteStudent(id: string) {
    const idNum = Number.parseInt(id, 10);
    this.apiService.delEntity('Student', idNum).subscribe((data: { response?: string; }) => {
      if (data && data.response === 'ok') {
        this.store.dispatch(studentDelete({id: idNum}));
        // this.dataSource.data = this.dataSource.data.filter(student => student.user_id !== id);
        return this.showSnackBar('Студент видалений, дані збережено');
      }
    });
  }

  transferStudent(student: Student) {
    this.showTransferStudentModalWindow(student)
      .afterClosed().subscribe((response) => {
        if (!response) {
          return this.showSnackBar('НЕМАЄ ВІДПОВІДІ ВІД СЕРВЕРУ. МОЖЛИВІ ПРОБЛЕМИ З ПІДКЛЮЧЕННЯМ АБО СЕРВЕРОМ');
        } else if (response.response === 'ok') {
          // this.showStudentsByGroup();
          return this.showSnackBar('Студент переведений');
        } else if (response === 'Canceled') {
          // return this.showSnackBar('Скасовано');
        }
      });
  }

  openConfirmDialog(name: string, surname: string, id: string) {
    const message = `Підтвердіть видалення користувача "${surname} ${name}"`;
    return this.modalService.openConfirmModal(message, () => this.deleteStudent(id));
  }

  showSnackBar(message: string) {
    return this.matSnackBar.open(message, '', {
      duration: 3000,
    });
  }

  showModalWindow(buttonText: string, edit?: boolean, student?: Student) {
    return this.dialog.open(StudentsModalWindowComponent, {
      disableClose: true,
      width: '700px',
      height: 'calc(100vh - 50px)',
      data: {
        group_id: this.groupdID,
        student_data: student,
        updateStudent: edit,
        submitButtonText: buttonText,
      }
    });
  }

  showTransferStudentModalWindow(student: Student) {
    return this.dialog.open(TransferStudentModalWindowComponent, {
      disableClose: true,
      width: '600px',
      data: {
        group_id: this.groupdID,
        student_data: student
      }
    });
  }

  showViewStudentModalWindow(student: Student) {
    return this.dialog.open(ViewStudentModalWindowComponent, {
      disableClose: true,
      width: '700px',
      panelClass: 'student-view-dialog-container',
      data: {
        group_id: this.groupdID,
        student_data: student
      }
    });
  }
}
