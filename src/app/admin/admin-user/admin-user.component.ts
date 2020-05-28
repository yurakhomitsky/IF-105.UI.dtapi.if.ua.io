import { Component, OnInit } from '@angular/core';
import { IAdminUser } from './admin-user.interface';
import { of, from, Observable, throwError } from 'rxjs';
import { mergeMap, startWith } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateUpdateUserComponent } from './create-update-user/create-update-user.component';
import { catchError } from 'rxjs/operators';
import { ModalService } from '../../shared/services/modal.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { Column, tableActionsType, ActionTable } from '../../shared/mat-table/mat-table.interface';
@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})
export class AdminUserComponent implements OnInit {
  public userList: Array<IAdminUser> = [];
  public filteredList: Array<IAdminUser> = [];
  public displayedColumns: string[] = ['idColumn', 'userNameColumn', 'emailColumn', 'actionsColumn'];
  public searchValue = '';
  public dataSource: MatTableDataSource<IAdminUser>;
  adminUsers: IAdminUser[] = [];

  columns: Column [] = [
    {columnDef: 'id', header: 'ID'},
    {columnDef: 'username', header: 'Імя'},
    {columnDef: 'email', header: 'Електронна почта'},
    {columnDef: 'action', header: 'Дії', actions: [
      {type: tableActionsType.Edit, icon: 'edit', matTooltip: 'Редагувати', aria_label: 'edit'},
      {type: tableActionsType.Remove, icon: 'delete', matTooltip: 'Видалити', aria_label: 'delete'}
    ]}
  ];
  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private modalService: ModalService) { }

  ngOnInit() {
    this.apiService.getEntity('AdminUser')
    .subscribe((data: IAdminUser[]) => {
        this.userList = data;
    })
  }


  getAction(action: ActionTable<IAdminUser>) {
    const actions = {
      edit: () => {
         this.updateHandler(action.body)
      },
      remove: () => {
        this.openConfirmDialog(action.body);
      },
      default() {
        throwError('Error');
      }
    };
    (actions[action.type] || actions.default)();
  }

  updateHandler(user: IAdminUser) {
    const dialogRef = this.dialog.open(CreateUpdateUserComponent, {
      width: '450px',
      disableClose: true,
      data: user,
    });

    let newData: IAdminUser;

    dialogRef.afterClosed()
      .pipe(
        mergeMap((data) => {
          if (data) {
            const { id, username, email, password, password_confirm } = data;
            newData = ({ id, username, email } as IAdminUser);
            return this.apiService.updEntity('AdminUser', { username, email, password, password_confirm }, id);
          }
          return of(null);
        })
      )
      .subscribe(() => {
        if (newData) {
          this.userList = this.userList.map(user => {
            if (user.id === newData.id) {
              return newData;
            }
            return user;
          });
        }
      });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
    });
  }

  openConfirmDialog(user: IAdminUser) {
    const message = `Підтвердіть видалення користувача "${user.username}"`;
    this.modalService.openConfirmModal(message, () => this.delUser(user));
  }
  delUser(user: IAdminUser) {
    this.apiService.delEntity('AdminUser', user.id).subscribe((data: { response?: string; }) => {
      if (data && data.response === 'ok') {
        this.userList = this.userList.filter(existedUser => existedUser.id !== user.id);
      }
    }, (error: any) => {
      this.openSnackBar('Помилка видалення');
    });
  }
  
  addAdminHandler() {
    const dialogRef = this.dialog.open(CreateUpdateUserComponent, {
      width: '450px',
      disableClose: true,
    });

    dialogRef.afterClosed()
      .pipe(
        mergeMap((data: IAdminUser) => {
          if (data) {
            return this.apiService.createEntity('AdminUser', data);
          }
          return of(null);
        }),
        catchError(e => {
          this.openSnackBar('Сталася помилка');
          return of(null);
        })
      )
      .subscribe((newData: IAdminUser) => {
        if (newData) {
          this.openSnackBar('Збережено');
          this.userList = [ ...this.userList,newData];
        }
      });
  }

  filterHandler(event) {
    this.searchValue = event.target.value;
    this.filteredList = this.userList.filter(user => {
      return user.username.includes(this.searchValue);
    });
  }
}
