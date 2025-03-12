import api from "./Apis"

export async function getConsultingList() {
    const url = `/adinquiry/list`

    const response = await getData(url)

    if (response) {
        return response
    }
}

export async function getUSerInquiryList({ memberId }) {
    const url = `/adinquiry/${memberId}`

    const response = await getData(url)

    console.log("회원의 문의 기록 조회 결과 : ", response)

    if (response) {
        return response
    }
}

export async function sendChat({ newChat }) {
    console.log("API 전달 전 : ", newChat)

    const url = `/adinquiry/sendChat`

    await api.post(url, newChat)
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
