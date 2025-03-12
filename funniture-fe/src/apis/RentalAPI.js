import api from "./Apis";

const baseRentalUrl = 'http://localhost:8080/api/v1/rental'

// ---------------------------------------------------- 관리자 -------------------------------------------------------------

export async function getAdminRentalList(searchRental, pageNum) {

    const url = '/rental'
    const params = new URLSearchParams();

    if (searchRental.rentalState) {
        params.append('rentalState', searchRental.rentalState);
    }
    if (searchRental.storeName) {
        params.append('storeName', searchRental.storeName);
    }
    if (searchRental.categoryName) {
        params.append('categoryName', searchRental.categoryName);
    }
    if (searchRental.searchDate) {
        params.append('searchDate', searchRental.searchDate);
    }
    if (searchRental.rentalNo) {
        params.append('rentalNo', searchRental.rentalNo);
    }
    if (pageNum) {
        params.append("offset", pageNum)
    }

    const response = await getData(url, params);

    return response
}

export async function getStoreList() {
    return await fetch('http://localhost:8080/api/v1/product/ownerlist?categoryCode=1&categoryCode=2').then(res => res.json());
}

export async function getAllStoreList() {
    return await fetch('http://localhost:8080/api/v1/product/ownerlist').then(res => res.json());
}

export async function getSalesByDate(yearMonth,selectedStore,pageNum) {

    const url = '/rental/admin/sales'
    const params = new URLSearchParams();

    if (yearMonth) {
        params.append('yearMonth', yearMonth);
    }
    if (selectedStore) {
        params.append('storeName', selectedStore);
    }
    if (pageNum) {
        params.append("offset", pageNum)
    }
    
    const response = await getData(url, params);

    return response
}

export async function getSalesByMonthChartData(yearMonth,groupBy) {

    const url = '/rental/chart'
    const params = new URLSearchParams();

    if (yearMonth) {
        params.append('yearMonth', yearMonth);
    }
    if (groupBy) {
        params.append('groupBy', groupBy);
    }
    
    const response = await getData(url, params);

    return response
}

export async function getTopMonthlySales(yearMonth) {

    const url = '/rental/chart/monthly/top'
    const params = new URLSearchParams();

    if (yearMonth) {
        params.append('yearMonth', yearMonth);
    }

    const response = await getData(url, params);

    return response
}

// ---------------------------------------------------- 사용자 -------------------------------------------------------------

// 사용자별 예약 전체 조회(페이징 처리)
export async function getUserOrderList(memberId, period, searchDate, pageNum) {
    // const url = new URL(baseRentalUrl + `/user?memberId=${memberId}`);
    const url = '/rental/user'
    const params = new URLSearchParams()


    // period 값이 존재하면 URL에 추가
    if (memberId){
        params.append("memberId", memberId)
    }
    if (period) {
        params.append("period", period);
    }
    if (searchDate) {
        params.append("searchDate", searchDate)
    }
    if (pageNum) {
        params.append("offset", pageNum)
    }

    const response = await getData(url, params)

    return response;
}

// 사용자의 예약진행상태별 카운트
export async function getRentalStateList(memberId) {
    const url = '/rental/count'
    const params = new URLSearchParams()

    if (memberId) {
        params.append("memberId", memberId)
    }

    const response = await getData(url, params)

    return response;
}

// 사용자별 사용중인 예약 조회(페이징 처리)
export async function getActiveRentalList(memberId, pageNum) {
    const url = '/rental/active'
    const params = new URLSearchParams()

    if(memberId) {
        params.append("memberId", memberId)
    }

    if(pageNum) {
        params.append("offset", pageNum)
    }

    const response = await getData(url, params)

    return response;
}

// 주문 상세 조회
export async function getOrderDetail(id) {
    const url = `/rental/${id}`

    const response = await getData(url);

    console.log('response', response)

    return response
}

// 사용자 예약 등록
export const postRentalReservation = async (rentalData) => {
    try {
        const url = `/rental/regist`;  
        const response = await api.post(url, rentalData);  
        return response.data;  
    } catch (error) {
        console.error('예약 등록 API 호출 실패:', error);
        throw error; 
    }
};

export const putRentalDeliveryAddress = async (rentalNo, destinationNo) => {
    const url = `/rental/${rentalNo}/deliveryaddress`;
    
    // destinationNo를 단순히 숫자로 보내기
    await api.put(url, destinationNo);
}

// ---------------------------------------------------- 제공자 -------------------------------------------------------------

export const getOwnerRentalList = async (ownerNo, period, rentalTab, pageNum) => {
    const url = `/rental/owner`
    const params = new URLSearchParams()
   
    if(ownerNo) {
        params.append("ownerNo", ownerNo)
    }
    // period 값이 존재하면 URL에 추가
    if (period) {
        params.append("period", period);
    }
    if (rentalTab) {
        params.append("rentalTab", rentalTab)
    }
    if (pageNum) {
        params.append("offset", pageNum)
    }

    const response = await getData(url, params)

    return response;
}

export async function putRentalConfirm(rentalNos) {
    const url = `/rental/confirmBatch?rentalNos=${rentalNos.join('&rentalNos=')}`;
    await api.put(url);

}

export async function cancelOrder(rentalNo) {
    const url = `/rental/cancel?rentalNo=${rentalNo}`;

    await api.put(url);

}

export async function putDeliverySubmit(rentalNo, deliveryNo, deliverCom) {
    const url = `/rental/${rentalNo}/delivery?deliveryNo=${deliveryNo}&deliverCom=${deliverCom}`;

    await api.put(url)
}

export async function putUpdateRentalState(rentalNo) {
    const url = `/rental/${rentalNo}/state`;

    await api.put(url)
}

export async function getSalesByOwner(memberId, yearMonth, productNo) {
    const url = `/rental/${memberId}/sales`
    const params = new URLSearchParams()
   
    if(yearMonth) {
        params.append("yearMonth", yearMonth)
    }
    // period 값이 존재하면 URL에 추가
    if (productNo) {
        params.append("productNo", productNo);
    }

    const response = await getData(url, params)

    return response;
}

// 제공자의 예약진행상태별 카운트
export async function getRentalStateCountByOwner(memberId) {
    const url = `/rental/${memberId}/count`

    const response = await getData(url)

    return response;
}

// 제공자의 만료일 기준 기간별 카운트 
export async function getRentalPeriodCountByOwner(memberId,period) {
    const url = `/rental/${memberId}/period/count`
    const params = new URLSearchParams();

    if (period) {
        params.append("period", period);
    }

    const response = await getData(url, params);

    return response;
}

// 제공자의 이번 달 매출 조회 성공(상품별 합산)
export async function getCurrentMonthSalesByOwner(memberId, yearMonth) {
    const url = `/rental/${memberId}/chart/currentMonth`
    const params = new URLSearchParams();

    console.log('yearMonth', yearMonth)

    if (yearMonth) {
        params.append("yearMonth", yearMonth);
    }

    const response = await getData(url, params);

    return response;
}

// 제공자의 월별 매출 조회 성공(상품전체 합산)
export async function getMonthlySalesByOwner(memberId, yearMonth) {
    const url = `/rental/${memberId}/chart/monthly`
    const params = new URLSearchParams();

    console.log('yearMonth', yearMonth)

    if (yearMonth) {
        params.append("yearMonth", yearMonth);
    }

    const response = await getData(url, params);

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