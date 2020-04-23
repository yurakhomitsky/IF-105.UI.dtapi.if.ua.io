
import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { Subject } from '../../entity.interface';

export const loadSubjects = createAction(
    '[Subject data] Load All Subjects'
);

export const allSubjectsLoaded = createAction(
    '[Load Subjects Effect] All Subjects Loaded',
    props<{ subjects: Subject[] }>()
);

export const subjectUpdate = createAction(
    '[Edit Subject Dialog] Subject Updated',
    props<{ update: Update<Subject> }>()
);

export const subjectCreate = createAction(
    '[Create Subject Dialog] Subject Create',
    props<{create: Subject}>()
)
export const subjectDelete = createAction(
    '[Delete Subject Dialog] Subject Delete',
    props<{id: number}>()
)
