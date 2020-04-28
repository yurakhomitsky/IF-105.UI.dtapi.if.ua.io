import { createAction, props } from '@ngrx/store';
import { Test } from '../../entity.interface';
import { Update } from '@ngrx/entity';

export const loadTests = createAction(
    '[Tests Data] Load Tests',
    props<{ subjectId: number }>()
)

export const testsLoaded = createAction(
    '[Tests Data] Tests Loaded',
    props<{ tests: Test[], subjectId:number }>()
)

export const testUpdate = createAction(
    '[Edit test Dialog] Test Updated',
    props<{ update: Update<Test> }>()
);

export const testCreate = createAction(
    '[Create Test Dialog] Test Create',
    props<{ create: Test }>()
)
export const testDelete = createAction(
    '[Delete Test Dialog] Test Delete',
    props<{ id: number }>()
)
export const testError = createAction(
    '[Tests Error] Test Error',
    props<{ failed: boolean }>()
)