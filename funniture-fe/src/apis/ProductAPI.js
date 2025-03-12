import { GET_CATEGORY_LIST } from '../redux/modules/CategoryModuls'
import api from "./Apis";
import { EDIT_PRODUCT_REQUEST, GET_PRODUCTLIST_BY_OWNERNO, REGISTER_PRODUCT_FAIL, REGISTER_PRODUCT_REQUEST, REGISTER_PRODUCT_SUCCESS } from '../redux/modules/productReducer';

const baseProductUrl = 'http://localhost:8080/api/v1/product'

// 카테고리 조회 (store에 저장)
export function getCategory(refCategory) {
    return async (dispatch) => {
        try {
            const categoryUrl = `/product/category?refCategoryCode=${refCategory}`

            const categoryListRes = await getData(categoryUrl)

            dispatch({
                type: GET_CATEGORY_LIST,
                payload: {
                    categoryList: categoryListRes.results?.result ?? [],
                    refCategory: refCategory
                },
            })
        } catch (error) {
            console.error("카테고리 및 회사 정보 호출 에러 : ", error)
        }
    }
}

// 카테고리 조회 refCategory 없는거
export async function getSubAllCategory() {

    const categoryUrl = `/product/category`;

    const categoryListRes = await getData(categoryUrl)

    return categoryListRes
}

// 검색 조건에 상응하는 데이터 조회
export async function getProductList({ conditions, refCategoryCode, pageNum, paging } = {}) {

    console.log("검색 조건 : ", conditions)
    console.log("pageNum : ", pageNum)

    const url = '/product'
    const params = new URLSearchParams()

    if (conditions && conditions != undefined) {
        if (conditions.categoryCodeList?.length > 0) {
            conditions.categoryCodeList.map(categoryCode => {
                params.append('categoryCode', categoryCode);
            })
        } else if (refCategoryCode) {
            params.append('categoryCode', refCategoryCode);
        }

        if (conditions.ownerNo.length > 0) {
            conditions.ownerNo.map(owner => {
                params.append('ownerNo', owner);
            })
        }

        if (conditions.productStatus?.trim() != '' && conditions.productStatus) {
            params.append("productStatus", conditions.productStatus?.toString())
        }

        if (conditions.searchText?.trim() != '') {
            params.append("searchText", conditions.searchText?.toString())
        }
    }

    if (paging) {
        params.append("pageNum", pageNum)
    }

    console.log("검색 조건 결과 요청 params : ", params.toString())

    const response = await getData(url, params)

    console.log("데이터 가져온 결과임!!!!!!!!!!!!!!!!!! : ", response)

    return response
}

// 카테고리에 따른 제공자 목록 정보 조회
export async function getOwnerListByCategory(categoryList, refCategoryCode) {

    const url = '/product/ownerlist'
    const params = new URLSearchParams();

    if (categoryList?.length > 0) {
        categoryList.map(category => {
            params.append('categoryCode', category);
        })
    } else {
        params.append('categoryCode', refCategoryCode);
    }

    const response = await getData(url, params)

    return response
}

// 전체 제공자 목록 조회
export async function getOwnerAllList() {

    const url = '/product/ownerlist'

    const response = await getData(url)

    return response
}

// 상품 상태 정보 수정
export async function changeProductStatus(productNoList, changeStatueValue) {
    const url = baseProductUrl + '/changestatus'

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productList: productNoList,
            changeStatus: changeStatueValue
        })
    }).then(res => res.json())

    console.log("상품 상태 정보 수정 : ", response)
    return response
}

// 제공자 별 상품 리스트 조회
export function getProductListByOwnerNo(ownerNo) {

    return async (dispatch) => {
        try {
            console.log("ownerNo : ", ownerNo)

            const url = `/product/owner?ownerNo=${ownerNo}`

            const response = await getData(url)

            console.log("제공자의 전체 상품 정보 response : ", response)

            dispatch({
                type: GET_PRODUCTLIST_BY_OWNERNO,
                payload: {
                    allProductList: response?.results.result
                }
            })

        } catch (error) {

        }
    }
}

// 상품 상세 정보가져오기
export async function getProductDetailInfo(productNo) {
    const url = `/product/${productNo}`

    const response = await getData(url)

    return response
}

// 상품 등록하기
export async function registerProduct(dispatch, formData, rentalOptions, productImage) {
    console.log("API formData : ", formData)
    console.log("API rentalOptions : ", rentalOptions)
    console.log("API productImage : ", productImage)

    dispatch({ type: REGISTER_PRODUCT_REQUEST })

    const url = "/product/register"

    const data = new FormData();
    data.append("formData", new Blob([JSON.stringify(formData)], { type: "application/json" })); // formData를 JSON 문자열로 추가
    data.append("rentalOptions", new Blob([JSON.stringify(rentalOptions)], { type: "application/json" })); // rentalOptions를 JSON 문자열로 추가
    data.append("productImage", productImage);

    const response = await api.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

    if (response?.data.httpStatusCode == 201) {
        dispatch({
            type: REGISTER_PRODUCT_SUCCESS,
            payload: {
                msg: response.data.message
            },
        })
    } else {
        dispatch({
            type: REGISTER_PRODUCT_FAIL,
            payload: {
                error: response.data.message
            },
        })
    }
    return response?.data
}

// 상품 정보 수정하기
export async function modifyProductInfo({ dispatch, formData, rentalOptions, productImage, productNo }) {
    dispatch({ type: EDIT_PRODUCT_REQUEST })

    console.log("API 전달 할 데이터 formData : ", formData)
    console.log("API 전달 할 데이터 rentalOptions : ", rentalOptions)
    console.log("API 전달 할 데이터 productImage : ", productImage)

    const data = new FormData();
    data.append("formData", new Blob([JSON.stringify(formData)], { type: "application/json" })); // formData를 JSON 문자열로 추가
    data.append("rentalOptions", new Blob([JSON.stringify(rentalOptions)], { type: "application/json" })); // rentalOptions를 JSON 문자열로 추가
    if (productImage != null) {
        data.append("productImage", productImage);
    }

    const url = `/product/modify/${productNo}`

    const response = await api.put(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

    console.log("수정API 응답 : ", response)

    return response?.data
}

// react quill 이미지 업로드
export async function uploadQuillImg(switchFile) {
    console.log("switchFile : ", switchFile)

    const url = `/product/quillimg`

    const formData = new FormData();
    formData.append("file", switchFile);

    const response = await api.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

    console.log("uploadUrlData : ", response)

    return response?.data
}

// 최근 본 상품 정보 가져오기
export async function getResentProduct(recentList) {
    console.log("전송하는 데이터 : ", recentList)

    const url = "/product/recentlist"

    const response = await api.post(url, recentList)

    console.log("상품 정보 결과 : ", response)

    if (response?.status == 200) {
        return response?.data
    }
}

// 카테고리별 상품 등록 현황 가져오기
export async function getProductCount() {

    const url = "/product/count"

    const response = await api.get(url)

    console.log(response)

    return response.data.results
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
