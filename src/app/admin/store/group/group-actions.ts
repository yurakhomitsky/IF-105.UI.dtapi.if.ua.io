import { createAction, props } from '@ngrx/store';
import { Group, Faculty, Speciality } from 'src/app/shared/entity.interface';
import { Update } from '@ngrx/entity';

export const loadGroups = createAction(
    '[Group data] Load  Groups',
    props<{pageSize: number, offset: number}>()
);
export const loadFacultiesForGroups = createAction(
    '[Faculty data] Load  Faculties',
);
export const loadSpecialitiesForGroups = createAction(
    '[Speciality data] Load  Specialities',
);
export const groupsLoaded = createAction(
    '[Load Groups Effect] Groups Loaded',
    props<{ groups: Group[] }>()
);

export const groupUpdate = createAction(
    '[Edit group Dialog] Group Updated',
    props<{ update: Update<Group> }>()
);

export const groupCreate = createAction(
    '[Create Group Dialog] Group Create',
    props<{create: Group}>()
)
export const groupDelete = createAction(
    '[Delete Group Dialog] Group Delete',
    props<{id: number}>()
)