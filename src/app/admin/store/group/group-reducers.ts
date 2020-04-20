import { Group } from 'src/app/shared/entity.interface';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import GroupAction from './group-types';


export interface GroupState extends EntityState<Group> {

}

export const adapter = createEntityAdapter<Group>({
    selectId: group => group.group_id,
});

export  const initialGroupsState = adapter.getInitialState({

});

export const groupsReducer = createReducer(
    initialGroupsState,
    on(GroupAction.groupsLoaded, (state, action) => adapter.addAll(action.groups, state) ),

    on(GroupAction.groupUpdate, (state, action) =>
    adapter.updateOne(action.update, state)),

    on(GroupAction.groupCreate, (state, action) => adapter.addOne(action.create,state)),

    on(GroupAction.groupDelete, (state, action) => adapter.removeOne(action.id,state))
);


export const { selectAll:selectGroups } = adapter.getSelectors();