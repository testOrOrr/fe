import { GET_CHAT_QA_LIST } from "../redux/modules/ChatModule"
import api from "./Apis"

export function getChatQaList({ refNum, levelNum } = {}) {
    console.log("refNum : ", refNum, " levelNum : ", levelNum)
    return async (dispatch) => {
        console.log("챗봇 질문 리스트 호출")
        try {
            console.log("챗봇 질문 try 내부")

            let url = ''

            if (!refNum && !levelNum) {
                url = `/chat/list`
            } else {
                if (refNum) {
                    console.log("전달 받은 상위 번호 : ", refNum)
                    url = `/chat/list?refNum=${refNum}`
                } else if (levelNum) {
                    console.log("전달 받은 단계 : ", levelNum)
                    url = `/chat/list?qaLevel=${levelNum}`
                    console.log(url)
                }
            }

            const chatQaList = await getData(url)

            console.log("chatQaList : ", chatQaList)

            if (chatQaList) {
                console.log("조회결과 :  ", chatQaList)
                dispatch({
                    type: GET_CHAT_QA_LIST,
                    payload: {
                        chatQaList: chatQaList.results?.result,
                        refList: chatQaList.results?.refResult
                    }
                })
            }
        } catch (error) {
            console.log("챗봇 질문 catch 내부 : ", error)
        }
    }
}

export async function updateChatQaList({ updateList }) {
    console.log("업데이트 하러 가기 전 updateList : ", updateList)

    const url = `/chat/modify`

    const result = await api.put(url, updateList)

    console.log("result : ", result)

    return result?.data.message
}

export async function deleteChatItemAPI({ chatNo }) {
    console.log("삭제 대상 번호 : ", chatNo)

    const url = `/chat/delete?chatNo=${chatNo}`

    const result = await api.delete(url)

    console.log("삭제 결과 result : ", result)

    return result?.data.message
}

// 공용
const getData = async (url, query) => {
    let response

    if (!query) {
        response = await api.get(url)
    } else {
        response = await api.get(url, { params: query })
    }

    return response?.data
}