import { GET_FAVORITE_LIST } from "../redux/modules/FavoriteModule"
import api from "./Apis"


// 사용자 관심 상품 리스트 가져오기
export function getFavoriteList(memberId) {
    return async (dispatch) => {
        try {
            const url = `/favorite?memberId=${memberId}`

            const response = await getData(url)

            console.log("response : ", response)

            if (response.httpStatusCode == 200) {

                dispatch({
                    type: GET_FAVORITE_LIST,
                    payload: {
                        memberId: memberId,
                        favoriteList: response?.results.result
                    }
                })

            }
        } catch (error) {
            console.log("사용자 관심 목록 가져오기 실패 : ", error)
        }
    }
}

// 사용자 관심 상품 상세 정보 가져오기
export async function getFavoriteInfoList(memberId) {

    const url = `/favorite/detailInfo?memberId=${memberId}`

    const response = await getData(url)

    if (response.httpStatusCode == 200) {
        return response?.results
    }
}

// 관심 상품 수정하기
export async function updateFavoriteList(memberId, favoriteList) {
    const url = `/favorite/update`

    console.log("API 보내기 전 : ", memberId, favoriteList)

    const data = {
        memberId,
        favoriteList
    }

    const response = await api.post(url, data)

    console.log("response 입니다 : ", response)

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