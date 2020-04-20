import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogData } from '../group-modal.interface';
import { Observable } from 'rxjs';
import { Faculty, Speciality } from 'src/app/shared/entity.interface';
import { Store, select } from '@ngrx/store';
import { AdminState } from '../../store/MainReducer';
import { selectAllFaculties } from '../../store/faculty/faculty-selectors';
import { selectAllSpecialities } from '../../store/speciality/speciality-selectors';

@Component({
  selector: 'app-group-view-dialog',
  templateUrl: './group-view-dialog.component.html',
  styleUrls: ['./group-view-dialog.component.scss']
})
export class GroupViewDialogComponent implements OnInit {
  selectViewForm: FormGroup;
  listFaculties$: Observable<Faculty[]> = this.store.pipe(select(selectAllFaculties));
  listSpecialities$: Observable<Speciality[]> = this.store.pipe(select(selectAllSpecialities));

  constructor(
    public dialogRef: MatDialogRef<GroupViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private store: Store<AdminState>,
    private fb: FormBuilder,
  ) {
    dialogRef.disableClose = true;
    this.createForm();
  }
   private createForm() {
    this.selectViewForm = this.fb.group({
      id: [null, Validators.required]
    });
   }

  ngOnInit() {}

  onSubmit() {
    const result = this.selectViewForm.value;
    result.action = this.data.description.action;
    this.dialogRef.close(result);
  }
  onDismiss() {
    this.dialogRef.close();
  }
}
