import { createAction, props } from '@ngrx/store';
import { Group, Faculty, Speciality } from 'src/app/shared/entity.interface';
import { Update } from '@ngrx/entity';
import { Student } from '../../entity.interface';

export const loadStudents = createAction(
    '[Students data] Load  Students',
    props<{idGroup: number}>()
);
export const studentsLoaded = createAction(
    '[Load Students Effect] Students Loaded',
    props<{ students: Student[] }>()
);

export const studentUpdate = createAction(
    '[Edit student Dialog] Student Updated',
    props<{ update: Update<Student> }>()
);

export const studentCreate = createAction(
    '[Create Student Dialog] Student Create',
    props<{create: Student}>()
)
export const studentDelete = createAction(
    '[Delete Student Dialog] Student Delete',
    props<{id: number}>()
)
export const noStudents = createAction(
    '[Students Error] Student Error',
    props<{failed: boolean}>()
)