import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StudentState } from 'src/app/admin/store/student/student-reducers';
import { StudentInfo } from 'src/app/shared/entity.interface';
import { selectUserInfo } from '../store/studentTimeTable/studentTimeTable.selectors';
import { defaultImage } from 'src/app/shared/default-image/default-image';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit {
  studentInfo: StudentInfo;
  constructor(private store: Store<StudentState>) { }

  ngOnInit(): void {
    this.store.pipe(
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
      this.studentInfo = user;
    })
  }

}
