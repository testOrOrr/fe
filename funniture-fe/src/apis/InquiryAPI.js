import api from "./Apis";
import { INQUIRY_SELECT , COMMENT_OWNER } from "../redux/modules/OwnerModule";
import { INQUIRY_USER } from "../redux/modules/MemberModule";

// 상세 페이지 문의 불러오기
export const callInquiryByProductNoAPI = (productNo) => {
    const requestURL = `http://localhost:8080/api/v1/inquiry/product/${productNo}`;

    return async (dispatch) => {
        const response = await api.get(requestURL);
        console.log('productNo로 문의 조회 서버에 잘 다녀 왔나 response : ', response);

        // 데이터를 명시적으로 반환
        return response.data;
    };
};


// 제공자 마이 페이지 문의 불러오기
export const callInquiryByOwnerNoAPI = (ownerNo, page = 1, size = 10) => async (dispatch) => {
    if (!ownerNo) {
        console.error('Invalid ownerNo');
        return;
    }

    try {
        const response = await api.get(`/inquiry/owner/${ownerNo}?page=${page}&size=${size}`);
        if (!response.data || !response.data.results) {
            console.warn('Empty inquiry data received.');
            dispatch({ type: INQUIRY_SELECT, payload: { results: { data: [], pageInfo: {} } } });
            return;
        }

        dispatch({ type: INQUIRY_SELECT, payload: response.data });
        return response.data;
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        throw error;
    }
};



// 문의 등록
export const callInquiryRegistByProductNoAPI = (dataToSend, memberId) => {
    const requestURL = `http://localhost:8080/api/v1/inquiry/regist`;

    return async (dispatch) => {
        const response = await api.post(requestURL, { ...dataToSend, memberId });
        console.log('문의 등록 결과 서버에 잘 다녀 왔나 response : ', response);
        return response;
    };
};

// 마이 페이지에서 문의 데이터 불러오기
export const callAllInquiryByMypageAPI = (memberId, page = 1, size = 8) => async (dispatch) => {
    if (!memberId) {
        console.error('Invalid memberId');
        return;
    }
    console.log('memberId 잘 넘어왔나 : ', memberId);
    console.log('page 잘 넘어왔나 : ', page);
    try {
        const response = await api.get(
            `http://localhost:8080/api/v1/inquiry/member/${memberId}?page=${page}&size=${size}`
        );
        console.log('사용자 마이 페이지 전체 문의조회 서버에 잘 다녀 왔나 response : ', response);

        // 데이터를 저장
        dispatch({ type: INQUIRY_USER, payload: response.data });
        return response.data;
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        throw error;
    }
};


// 제공자 페이지에서 문의 답변하기 
export const callInquiryAnswerByOwnerPageAPI = (inquiryNo, commentContent, memberId) => {
    const requestURL = `http://localhost:8080/api/v1/comment/regist`;

    return async (dispatch) => {
        const response = await api.post(requestURL, {
            inquiryNo: inquiryNo,
            commentContent: commentContent,
            memberId: memberId
            // parentCommentNo: null // 일단 제공자 페이지에서는 대댓글 안 쓸 거니까 null로 보내기
        });
        console.log('문의 답변 결과 서버에 잘 다녀 왔나 response : ', response);
        return response;
    };
};

// 마이페이지에서 제공자의 답변을 가져오는 구문
export const getAnswerByInquiryNoAPI = (inquiryNo) => async () => {
    if (!inquiryNo) {
        console.error('Invalid inquiryNo');
        return;
    }

    try {
        const response = await api.get(`http://localhost:8080/api/v1/comment/inquiry/${inquiryNo}`);
        console.log('답변 내용 불러오기 성공:', response);
        return response.data;
    } catch (error) {
        console.error('답변 내용 불러오기 실패:', error);
        throw error;
    }
};

// 상세페이지에서 답변을 가져오는 구문
// InquiryAPI.js
export const callCommentByProduct = (inquiryNo) => async (dispatch) => {
    if (!inquiryNo) {
        console.error("Invalid inquiryNo");
        return;
    }

    try {
        const response = await api.get(`http://localhost:8080/api/v1/comment/product/${inquiryNo}`);
        console.log("답변 데이터 가져오기 성공:", response);

        return response.data; // 데이터를 반환하여 컴포넌트에서 사용할 수 있도록 함
    } catch (error) {
        console.error("답변 데이터 가져오기 실패:", error);
        throw error;
    }
};
