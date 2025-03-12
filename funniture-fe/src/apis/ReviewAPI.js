import api from "./Apis";
import { REVIEW_USER , REVIEW_WRITABLE , REVIEW_WRITTEN } from "../redux/modules/MemberModule";
import { REVIEW_SELECT } from "../redux/modules/OwnerModule";

// 마이 페이지에서 리뷰 데이터 불러오기
// export const callAllReviewByMypageAPI = (memberId, page = 1, size = 3) => async (dispatch) => {
//     if (!memberId) {
//         console.error('Invalid memberId');
//         return;
//     }
//     console.log('memberId 잘 넘어왔나 : ', memberId);
//     console.log('page 잘 넘어왔나 : ', page);
//     try {
//         const response = await api.get(
//             `http://localhost:8080/api/v1/review/member/${memberId}?page=${page}&size=${size}`
//         );
//         console.log('사용자 마이 페이지 전체 리뷰조회 서버에 잘 다녀 왔나 response : ', response);

//         // 데이터를 저장
//         dispatch({ type: REVIEW_USER, payload: response.data });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         throw error;
//     }
// };

// 마이페이지 작성 가능한 리뷰 조회 API
export const callWritableReviewsAPI = (memberId, page = 1, size = 3) => async (dispatch) => {
    if (!memberId) {
    console.error('Invalid memberId');
    return;
    }
    console.log('작성 가능한 리뷰 API 호출: memberId=', memberId, 'page=', page);
    try {
    const response = await api.get(
    `http://localhost:8080/api/v1/review/member/${memberId}?page=${page}&size=${size}`
    );
    console.log('작성 가능한 리뷰 조회 결과:', response);
    
    // 데이터를 저장
    dispatch({ type: REVIEW_WRITABLE, payload: response.data });
    return response.data;
    } catch (error) {
    console.error('Error fetching writable reviews:', error);
    throw error;
    }
    };

// 마이페이지 작성한 리뷰 조회 API
export const callWrittenReviewsAPI = (memberId, page = 1, size = 3) => async (dispatch) => {
    if (!memberId) {
        console.error('Invalid memberId');
        return;
    }
    try {
        const response = await api.get(
            `http://localhost:8080/api/v1/review/member/${memberId}/written?page=${page}&size=${size}`
        );
        dispatch({ type: REVIEW_WRITTEN, payload: response.data });
    } catch (error) {
        console.error('Error fetching written reviews:', error);
        dispatch({
            type: REVIEW_WRITTEN,
            payload: { results: { data: [], pageInfo: { cri: { pageNum: 1, amount: size }, total: 0 } } }
        });
    }
};


// 상세 페이지 리뷰 불러오기
export const callReviewByProductNoAPI = async (productNo) => {
    const requestURL = `http://localhost:8080/api/v1/review/product/${productNo}`;

    try {
        const response = await fetch(requestURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("서버 응답에 실패했습니다.");
        }

        return await response.json(); // 서버에서 반환된 JSON 데이터
    } catch (error) {
        console.error("리뷰 API 호출 실패:", error);
        throw error;
    }
};

// 제공자 상세 페이지 리뷰 불러오기
export const callReviewByOwnerNoAPI = (ownerNo, page = 1, size = 7) => async (dispatch) => {
    if (!ownerNo) {
        console.error('Invalid ownerNo');
        return;
    }

    try {
        const response = await api.get(
            `http://localhost:8080/api/v1/review/owner/${ownerNo}?page=${page}&size=${size}`
        );

        if (!response.data || !response.data.results || !response.data.results.result) {
            console.warn('No data found');
            dispatch({ type: REVIEW_SELECT, payload: { results: { result: { data: [] }, pageInfo: null } } });
        } else {
            dispatch({ type: REVIEW_SELECT, payload: response.data });
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};

// 메인 페이지 리뷰 불러오기
export const callReviewByMainAPI = async () => {
    try {
        const response = await api.get('/review/main');

        if (response.status !== 200) {
            throw new Error('서버 응답에 실패했습니다.');
        }

        return response.data; // 서버에서 반환된 JSON 데이터
    } catch (error) {
        console.error('리뷰 API 호출 실패:', error);
        throw error;
    }
};

// 문의 등록하기
export const callSubmitReviewAPI = (reviewData) => {
    const requestURL = `http://localhost:8080/api/v1/review/regist`;

    return async (dispatch) => {
        const response = await api.post(requestURL, { ...reviewData });
        console.log('리뷰 등록 결과 서버에 잘 다녀 왔나 response : ', response);
        return response;
    };
};