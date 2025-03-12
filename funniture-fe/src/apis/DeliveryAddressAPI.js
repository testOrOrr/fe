import api from "./Apis";

// 기본 배송지 조회
export async function getDefaultDeliveryAddressList(memberId) {
    const url = `/deliveryaddress/default/${memberId}`

    const response = await getData(url);

    return response;
}

// 배송지 전체조회
export async function getDeliveryAddressListData(memberId) {

    const url = `/deliveryaddress/${memberId}`

    const response = await getData(url);

    return response;
}

// 기본배송지로 수정
export async function putDefaultAddress(destinationNo) {
    const url = `/deliveryaddress/${destinationNo}/setDefault`;
    await api.put(url);
}

// 배송지 삭제
export async function putAddressDelete(destinationNo) {
    const url = `/deliveryaddress/${destinationNo}/delete`;
    await api.put(url);
}

// 배송지 등록 
export const postAddressRegist = async (addressData) => {

    const url = `/deliveryaddress/regist`;  
    await api.post(url, addressData);  
};

// 배송지 수정 
export const putAddress = async (destinationNo, addressData) => {

    const url = `/deliveryaddress/${destinationNo}/update`;  
    await api.put(url, addressData);  
};

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