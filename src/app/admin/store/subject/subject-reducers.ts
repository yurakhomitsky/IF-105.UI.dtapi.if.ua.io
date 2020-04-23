import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on, Action } from '@ngrx/store';
import * as SubjectAction from './subject-actions';
import { Subject } from '../../entity.interface';

export interface SubjectState extends EntityState<Subject> {
    allSubjectsLoaded: boolean;
}

export const adapter = createEntityAdapter<Subject>({
    selectId: subject => subject.subject_id,
});

export  const initialSubjectsState = adapter.getInitialState({
    allSubjectsLoaded: false
});

export const subjectsReducer = createReducer(
    initialSubjectsState,
    on(SubjectAction.allSubjectsLoaded, (state, action) => adapter.addAll(action.subjects, {...state, allSubjectsLoaded: true}) ),

    on(SubjectAction.subjectUpdate, (state, action) => adapter.updateOne(action.update, state)),

    on(SubjectAction.subjectCreate, (state, action) => adapter.addOne(action.create,state)),

    on(SubjectAction.subjectDelete, (state, action) => adapter.removeOne(action.id,state))
);

export function subjectReducer(state: SubjectState | undefined, action: Action) {
    return subjectsReducer(state, action);
  }
export const { selectAll: selectAllSubjects } = adapter.getSelectors();
