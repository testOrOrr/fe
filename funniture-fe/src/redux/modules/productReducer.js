import { createActions, handleActions } from "redux-actions";

let initialState = {
    loading: false,
    error: '',
    msg: '',
    ownerAllProductList: []
}

// 액션 타입
export const REGISTER_PRODUCT_REQUEST = 'product/REGISTER_PRODUCT_REQUEST';
export const REGISTER_PRODUCT_SUCCESS = 'product/REGISTER_PRODUCT_SUCCESS';
export const REGISTER_PRODUCT_FAIL = 'product/REGISTER_PRODUCT_FAIL';
export const EDIT_PRODUCT_REQUEST = 'product/EDIT_PRODUCT_REQUEST';
export const EDIT_PRODUCT_SUCCESS = 'product/EDIT_PRODUCT_SUCCESS';
export const EDIT_PRODUCT_FAIL = 'product/EDIT_PRODUCT_FAIL';
export const GET_PRODUCTLIST_BY_OWNERNO = 'product/GET_PRODUCTLIST_BY_OWNERNO';


// 액션 함수
const actions = createActions({
    [REGISTER_PRODUCT_REQUEST]: () => { },
    [REGISTER_PRODUCT_SUCCESS]: () => { },
    [REGISTER_PRODUCT_FAIL]: () => { },
    [EDIT_PRODUCT_REQUEST]: () => { },
    [EDIT_PRODUCT_SUCCESS]: () => { },
    [EDIT_PRODUCT_FAIL]: () => { },
    [GET_PRODUCTLIST_BY_OWNERNO]: () => { }
});

// 리듀서
const productReducer = handleActions({
    [REGISTER_PRODUCT_REQUEST]: (state, { payload }) => (
        {
            ...state,
            loading: true,
            error: '',
            msg: ''
        }),
    [REGISTER_PRODUCT_SUCCESS]: (state, { payload }) => (
        {
            ...state,
            loading: false,
            msg: payload.msg,
            error: ''
        }
    ),
    [REGISTER_PRODUCT_FAIL]: (state, { payload }) => (
        {
            ...state,
            loading: false,
            error: payload.error,
            msg: ''
        }
    ),
    [EDIT_PRODUCT_REQUEST]: (state, { payload }) => (
        {
            ...state,
            loading: true,
            error: '',
            msg: ''
        }),
    [EDIT_PRODUCT_SUCCESS]: (state, { payload }) => (
        {
            ...state,
            loading: false,
            msg: payload.msg,
            error: ''
        }
    ),
    [EDIT_PRODUCT_FAIL]: (state, { payload }) => (
        {
            ...state,
            loading: false,
            error: payload.error,
            msg: ''
        }
    ),
    [GET_PRODUCTLIST_BY_OWNERNO]: (state, { payload }) => (
        {
            loading: false,
            ownerAllProductList: payload.allProductList
        }
    )
}, initialState)

export default productReducer;