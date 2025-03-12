import api from "./Apis";

export async function getCurrentPoint(memberId) {
    const url = `/point/${memberId}`

    const response = await getData(url);

    return response;
}

export async function getPointList(memberId) {
    const url = `/point/logs/${memberId}`

    const response = await getData(url);

    return response;
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