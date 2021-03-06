import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Speciality } from '.././../entity.interface';
import { ApiService } from '../../../shared/services/api.service';
import { DialogFormComponent } from '../dialog-form/dialog-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ModalService } from '../../../shared/services/modal.service';
import { Store, select } from '@ngrx/store';
import { AdminState } from '../../store/MainReducer';
import { allSpecialitiesLoaded, loadAllSpecialities, specialityCreate, specialityUpdate, specialityDelete } from '../../store/speciality/speciality-actions';
import { selectAllSpecialities } from '../../store/speciality/speciality-selectors';
@Component({
  selector: 'app-speciality-list',
  templateUrl: './speciality-list.component.html',
  styleUrls: ['./speciality-list.component.scss']
})

export class SpecialityListComponent implements OnInit, AfterViewInit {

  public displayedColumns: string[] = ['code', 'name', 'buttons'];
  public dataSource = new MatTableDataSource<Speciality>();

  @ViewChild('table') table: MatTable<Element>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private modalService: ModalService,
    private store: Store<AdminState>) { }

  ngOnInit() {
    this.getSpeciality();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
  getSpeciality(): any {
    this.store.dispatch(loadAllSpecialities());
    this.store.pipe(
      select(selectAllSpecialities)
    ).subscribe((data: Speciality[]) => this.dataSource.data = data);
  }

  openConfirmDialog(speciality: Speciality) {
    const message = `Підтвердіть видалення спеціальності "${speciality.speciality_name}"`;
    this.modalService.openConfirmModal(message, () => this.delSpeciality(speciality));
  }
  delSpeciality(obj: Speciality) {
    this.apiService.delEntity('Speciality', obj.speciality_id)
      .subscribe((data) => {
        this.store.dispatch(specialityDelete({id: obj.speciality_id}));
        // this.dataSource.data = this.dataSource.data.filter(speciality => speciality.speciality_id !== obj.speciality_id);
        this.modalService.openSnackBar('Спеціальність ' + obj.speciality_name + ' була успішно видалена','success');
      },  err => {
        if (err.error.response.includes('Cannot delete')) {
          this.modalService.openInfoModal('Неможливо видалити спеціальність. Потрібно видалити групу цієї спеціальності');
        } else {
          this.modalService.openErrorModal('Помилка видалення');
        }
      });
  }
  addSpeciality() {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        return this.apiService.createEntity('Speciality', data).subscribe((obj: Speciality) => {
          this.modalService.openSnackBar('Спеціальність ' + data.speciality_name + ' була успішно створена','success');
          this.store.dispatch(specialityCreate({create: obj[0]}));
          // this.dataSource.data = [...this.dataSource.data, obj[0]];
          // this.table.renderRows();
        }, err => {
          this.modalService.openSnackBar('Помилка при додаванні','alert');
        }
        );
      }
    });
  }
  updSpeciality(speciality: Speciality) {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      data: speciality,
      width: '450px',
      disableClose: true,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: Speciality) => {
      if (data) {
        data.speciality_id = speciality.speciality_id;
        this.store.dispatch(specialityUpdate({
          update: {
            id: data.speciality_id,
            changes: data
          }
        }))
      }
    });
  }
  openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 2500,
    });
  }

}
