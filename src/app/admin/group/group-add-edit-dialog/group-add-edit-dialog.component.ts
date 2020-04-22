import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DialogData } from '../../group/group-modal.interface';
import { Speciality, Faculty } from 'src/app/shared/entity.interface';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/reducers';
import { Store, select } from '@ngrx/store';
import { selectAllFaculties } from '../../store/faculty/faculty-selectors';
import { selectAllSpecialities } from '../../store/speciality/speciality-selectors';

@Component({
  selector: 'app-group-add-edit-dialog',
  templateUrl: './group-add-edit-dialog.component.html',
  styleUrls: ['./group-add-edit-dialog.component.scss']
})
export class GroupAddEditDialogComponent implements OnInit {
  addEditForm: FormGroup;
  listFaculties$: Observable<Faculty[]> = this.store.pipe(select(selectAllFaculties));
  listSpecialities$: Observable<Speciality[]> = this.store.pipe(select(selectAllSpecialities));
  constructor(
    private store: Store<AppState>,
    public dialogRef: MatDialogRef<GroupAddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
   ) {
    dialogRef.disableClose = true;
    this.createForm();
  }

  private createForm() {
    if (this.data.group != null) {
      this.addEditForm = this.fb.group({
        'group_name': [this.data.group.group_name, Validators.required],
        'speciality_id': [this.data.group.speciality_id, Validators.required],
        'faculty_id': [this.data.group.faculty_id, Validators.required]
      });
    } else {
      this.addEditForm = this.fb.group({
        'group_name': [null, Validators.required],
        'speciality_id': [null, Validators.required],
        'faculty_id': [null, Validators.required]
      });
    }
  }


  ngOnInit() {}

  onSubmit() {
    this.dialogRef.close(this.addEditForm.value);
  }
  onDismiss() {
    this.dialogRef.close();
  }
}
