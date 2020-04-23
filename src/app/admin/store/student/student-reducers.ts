import {  Student } from 'src/app/shared/entity.interface';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import StudentAction from './student-types';




export interface StudentState extends EntityState<Student> {
    loading: boolean;
    groupsLoaded:number[];
}

export const adapter = createEntityAdapter<Student>({
    selectId: student => student.user_id,
});

export  const initialStudentState = adapter.getInitialState({
    loading: false,
    groupsLoaded: [],
});

export const studentsReducer = createReducer(
    initialStudentState,
    on(StudentAction.loadStudents, (state, action) => ({...state, loading: true})),

    on(StudentAction.studentsLoaded, (state, action) => adapter.addMany(action.students,
        // tslint:disable-next-line:max-line-length
        {...state, loading: false, groupsLoaded: [... new Set([...state.groupsLoaded,+action.students.find((student) => student.group_id).group_id])]})),

    on(StudentAction.studentUpdate, (state, action) => adapter.updateOne(action.update, state)),

    on(StudentAction.studentCreate, (state, action) => adapter.addOne(action.create,state)),

    on(StudentAction.studentDelete, (state, action) => adapter.removeOne(action.id,state)),

    on(StudentAction.noStudents,(state, action) => ({...state, loading: false}))
);


export const { selectAll:selectStudents} = adapter.getSelectors();