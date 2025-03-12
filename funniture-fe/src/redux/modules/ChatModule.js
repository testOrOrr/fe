import { createActions, handleActions } from "redux-actions"

// 초기값 
let initialState = {
    chatQaList: [],
    refList: [],
}

export const GET_CHAT_QA_LIST = "chat/GET_CHAT_QA_LIST"

const action = createActions({
    [GET_CHAT_QA_LIST]: () => { },
})

// 리듀서
const chatReducer = handleActions({
    [GET_CHAT_QA_LIST]: (state, { payload }) => ({
        chatQaList: payload.chatQaList,
        refList: payload.refList
    })
}, initialState)

export default chatReducer;