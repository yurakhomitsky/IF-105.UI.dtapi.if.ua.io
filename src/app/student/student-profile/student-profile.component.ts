import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StudentState } from 'src/app/admin/store/student/student-reducers';
import { StudentInfo } from 'src/app/shared/entity.interface';
import { selectUserInfo } from '../store/studentTimeTable/studentTimeTable.selectors';
import { defaultImage } from 'src/app/shared/default-image/default-image';
import { Observable } from 'rxjs';
import { UnSubscribeService } from 'src/app/shared/services/unsubsrice.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit, OnDestroy {
  studentInfo: StudentInfo;
  unsubscribe$: Observable<any>;

  constructor(private store: Store<StudentState>, private unSubscribeService: UnSubscribeService) { }

  ngOnInit(): void {
    this.unsubscribe$ = this.unSubscribeService.unsubscribeP;
    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(selectUserInfo)
    )
    .subscribe((user: StudentInfo) => {
      if (user.photo === '') {
        user = {
          ...user,
          photo: defaultImage
        }

        this.studentInfo = user;
      } else {
        this.studentInfo = user;
      }
    })
  }
  ngOnDestroy() {
    this.unSubscribeService.unSubscribe();
  }

}
