import { createActions, handleActions } from "redux-actions";

// 초기값 
let initialState = {
    memberId: '',
    favoriteList: []
}

// 액션 타입
export const GET_FAVORITE_LIST = 'favorite/GET_FAVORITE_LIST';

const action = createActions({
    [GET_FAVORITE_LIST]: () => { },
})

// 리듀서

const favoriteReducer = handleActions({
    [GET_FAVORITE_LIST]: (state, { payload }) => ({
        memberId: payload.memberId,
        favoriteList: payload.favoriteList
    }),
}, initialState)

export default favoriteReducer;