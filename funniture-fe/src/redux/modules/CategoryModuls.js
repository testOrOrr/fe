import { createActions, handleActions } from 'redux-actions';

// 초기값 
let initialState = {
    refCategoryCode: 1,
    categoryList: [],
}

// 액션 타입
export const GET_CATEGORY_LIST = 'category/GET_CATEGORY_LIST';

// 액션 함수
const actions = createActions({
    [GET_CATEGORY_LIST]: () => { },
});

// 리듀서
const categoryReducer = handleActions({
    [GET_CATEGORY_LIST]: (state, { payload, refCategory }) => (
        {
            refCategoryCode: payload.refCategory,
            categoryList: payload.categoryList,
        }),
}, initialState)

export default categoryReducer;