import * as ActionTypes from './ActionTypes';

const initialState = {
    profile: {
      firstname: '',
      lastname: '',
      username: '',
      password: '',
      admin: false
    },    
  }
  
  export const Users = (state = initialState, action) => {
    switch (action.type) {      
      case ActionTypes.ADD_USER:
        return {
          ...state,
          profile: action.payload.user
        }      
      default:
        return state;
    }
  }  
  