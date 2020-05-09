import {
  ActionReducer,
  ActionReducerMap,
  MetaReducer,
  Action,
} from '@ngrx/store';
import { AuthState } from '../login/reducers';
import * as AuthAction from '../login/reducers/index';


export interface AppState {
  login: AuthState;

}

export const reducers: ActionReducerMap<AppState> = {
  login: AuthAction.authReducer,
};

export function getInitialState() {
  return {
    login: AuthAction.initialAuthState,
  } as AppState;
}

export const metaReducers: MetaReducer<AppState>[] = [clearState];

export function clearState(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state: AppState, action: Action): AppState => {
    if (action.type === '[Toolbar] User Logout') {
      state = undefined
    }
      return reducer(state, action);
  };
}