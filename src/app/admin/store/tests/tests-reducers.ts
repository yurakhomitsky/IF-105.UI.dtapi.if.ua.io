import { Test } from 'src/app/shared/entity.interface';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on, Action } from '@ngrx/store';
import TestsActions from './tests-types';



export interface TestState extends EntityState<Test> {
    loading: boolean;
    subjectsLoaded: number[];
    noRecords: boolean;
}

export const adapter = createEntityAdapter<Test>({
    selectId: test => test.test_id,
});

export const initialTestState = adapter.getInitialState({
    loading: false,
    subjectsLoaded: [],
    noRecords: false
});

export const testsReducer = createReducer(
    initialTestState,
    on(TestsActions.loadTests, (state, action) => ({ ...state, loading: true })),

    on(TestsActions.testsLoaded, (state, { subjectId, tests }) => adapter.addMany(tests,
        // tslint:disable-next-line:max-line-length
        { ...state, loading: false, subjectsLoaded: [...new Set([...state.subjectsLoaded, subjectId])]})),

    on(TestsActions.testUpdate, (state, action) => adapter.updateOne(action.update, state)),

    on(TestsActions.testCreate, (state, action) => adapter.addOne(action.create, state)),

    on(TestsActions.testDelete, (state, action) => adapter.removeOne(action.id, state)),

    on(TestsActions.testError, (state, action) => ({ ...state, loading: false, noRecords: action.failed }))
);

export function testReducer(state: TestState | undefined, action: Action) {
    return  testsReducer(state, action);
  }
export const { selectAll: selectTests } = adapter.getSelectors();