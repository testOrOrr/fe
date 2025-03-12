import api from "./Apis"

export async function getAllNoticeList() {
    const url = '/notice/list'

    const response = await getData(url)

    if (response?.httpStatusCode == 200) {
        return response.results.result
    }

}

export async function registerNotice({ newNotice }) {
    console.log("API전달 전 : ", newNotice)

    const url = '/notice/register'

    const response = await api.post(url, newNotice)

    console.log(response)

    if (response) {
        return response.data?.message
    }
}

export async function deleteNotice({ noticeNo }) {
    const url = `/notice/delete?noticeNo=${noticeNo}`

    console.log(url)

    const response = await api.delete(url)

    console.log(response)

    if (response) {
        return response.data?.message
    }
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
