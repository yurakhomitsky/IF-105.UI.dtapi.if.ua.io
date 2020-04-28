import { Group } from 'src/app/shared/entity.interface';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import GroupAction from './group-types';
import { MAT_SORT_HEADER_INTL_PROVIDER } from '@angular/material/sort';



export interface GroupState extends EntityState<Group> {
    loading: boolean;
}

export const adapter = createEntityAdapter<Group>({
    selectId: group => group.group_id,
    sortComparer: (g1:Group, g2: Group) => g1.group_id - g2.group_id
});

export  const initialGroupsState = adapter.getInitialState({
    loading: false,
});

export const groupsReducer = createReducer(
    initialGroupsState,
    on(GroupAction.loadGroups, (state, action) => ({...state, loading: true})),

    on(GroupAction.groupsLoaded, (state, action) => adapter.addMany(action.groups, {...state, loading: false})),

    on(GroupAction.groupUpdate, (state, action) => adapter.updateOne(action.update, state)),

    on(GroupAction.groupCreate, (state, action) => adapter.addOne(action.create,state)),

    on(GroupAction.groupDelete, (state, action) => adapter.removeOne(action.id,state))
);

export const { selectAll:selectGroups, selectTotal:selectGroupsTotal } = adapter.getSelectors();