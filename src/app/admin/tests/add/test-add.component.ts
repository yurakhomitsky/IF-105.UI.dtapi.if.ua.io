import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from '../../entity.interface';
import { ApiService } from 'src/app/shared/services/api.service';
import { AdminState } from '../../store/MainReducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAllSubject } from '../../store/subject/subject-selectors';

export interface DialogData {
  data: any;
  description: any;
}

@Component({
  selector: 'app-test-add',
  templateUrl: './test-add.component.html',
  styleUrls: ['./test-add.component.scss']
})
export class TestAddComponent implements OnInit {
  subjects: Subject[] = [];
  subjects$: Observable<Subject[]> = this.store.select(selectAllSubject);
  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<TestAddComponent>,
    private store: Store<AdminState>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
  }
}
