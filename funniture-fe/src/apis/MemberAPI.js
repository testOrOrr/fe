import { useSelector } from "react-redux";
import { POST_REGISTER, POST_LOGIN, GET_MEMBER, GET_EMAIL, RESET_MEMBER, POST_OWNERDATA, CHANGE_ISCONSULTING } from "../redux/modules/MemberModule";
import api from "./Apis";
import imageApi from "./Apis";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GET_OWNERINFO } from "../redux/modules/OwnerModule";

// 회원 가입
export const callSignupAPI = ({ form }) => {
    const requestURL = `http://localhost:8080/api/v1/auth/signup`;

    return async (dispatch, getState) => {
        console.log('MemberAPI의 dispatch : ', dispatch);
        console.log('MemberAPI의 getState : ', getState);
        const result = await fetch(requestURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            body: JSON.stringify({
                email: form.email,
                userName: form.userName,
                password: form.password
            }),
        }).then(res => res.json());

        console.log('회원 가입 데이터 서버에 보내고 리턴된 result : ', result);
        if (result.status === 200) {
            console.log('result.status : ', result.status);
            dispatch({ type: POST_REGISTER, payload: result });
        }
        return result; // 결과를 반환합니다.
    };
};


// 최초 회원 가입 할 때 이메일 입력 시, 중복된 이메일인지 체크하는 API
export const callGetMemberEmailAPI = async (email) => {
    const requestURL = `http://localhost:8080/api/v1/auth/validation/${email}`;

    try {
        const response = await api.get(requestURL); // 서버에서 이메일 중복 여부 확인
        const isDuplicate = response.data.results.response; // 서버에서 반환된 값 (true/false)

        console.log('isDuplacate : ', isDuplicate);

        return isDuplicate; // true: 중복 이메일 존재, false: 중복 이메일 없음
    } catch (error) {
        console.error('Error checking email:', error);
        return true; // 에러 발생 시 기본적으로 중복 처리 (보수적으로 처리)
    }
};

export async function updateCount(role) {
    const url = "/member/updateCount"

    await api.post(url, { role })
}

// 로그인 할 때 서버에 데이터를 보내고, 토큰 정보를 리턴 받음
export const callLoginAPI = ({ form }) => {
    const loginURL = `http://localhost:8080/api/v1/auth/login`;
    console.log('form', form);

    return async (dispatch, getState) => {
        try {
            const result = await fetch(loginURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            }).then((res) => res.json());

            console.log('로그인 시도 후 반환 받은 데이터 result : ', result);

            if (result.status === 200) {
                console.log('로그인 성공 result.status : ', result.status);
                window.localStorage.setItem('accessToken', result.userInfo.accessToken);
                dispatch({ type: POST_LOGIN, payload: result });

                dispatch(callGetMemberAPI(result.userInfo))

                updateCount(result.userInfo.memberRole)

                // 로그인 성공 시 true 반환
                return { success: true, message: result.message };
            } else {
                console.log('로그인 실패 : ', result.status);
                console.log('result.failType : ', result.message);

                // 로그인 실패 시 false 반환
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
            return { success: false, message: '네트워크 오류' };
        }
    };
};

// 접속자 수 업데이트



// 로그인 한 회원의 대한 정보를 불러오는 구문
export const callGetMemberAPI = ({ memberId }) => {
    return async (dispatch) => {
        const result = await api.get(`/member/${memberId}`)
        console.log('callGetMemberAPI 로그인한 회원 정보 resposne : ', result);

        dispatch({ type: GET_MEMBER, payload: result.data });
    };
};

// 회원 가입 시, 이메일 인증번호 보내는 구문
export const callSendEmailAPI = ({ form }) => {
    return async (dispatch) => {
        const result = await api.post(`/email/${form.email}`, {
            email: form.email
        });

        console.log('인증번호가 서버에 잘 다녀 왔나 result : ', result);

        dispatch({ type: GET_EMAIL, payload: result.data });
        return;
    };
};

export const callCertificationAPI = ({ email, verification }) => {
    return async (dispatch) => {
        try {
            const response = await api.post('/email/verify', { email, verification });
            if (response.data.success) {
                dispatch({ type: 'CERTIFICATION_SUCCESS' });
            }
        } catch (error) {
            console.error('인증 요청 중 오류 발생:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };
};

// 로그인 페이지에서 비밀번호 변경 로직
export const callChangePassAPI = ({ form }) => {
    const requestURL = `http://localhost:8080/api/v1/member/findPass`

    return async (dispatch, getState) => {
        console.log('비빌번호 변경 요청 서버에 잘 갔나.');
        const result = api.post(requestURL, {
            email: form.email,
            password: form.password
        })
        console.log('서버에 잘 다녀왔나 result : ', result);
        alert('비밀번호 변경이 완료되었습니다.');
    }

}

// 사용자 개인 정보 변경 전, 비밀번호 검증 로직
export const callConfirmPassword = (memberId, password) => {
    const requestURL = `http://localhost:8080/api/v1/member/conform`;

    return async (dispatch, getState) => {
        console.log('서버에 보낼 memberId:', memberId);
        console.log('서버에 보낼 password:', password);

        try {
            const response = await api.post(requestURL, { memberId, password });

            // 응답 데이터 확인
            console.log('서버 응답:', response.data);

            // 응답 데이터의 status 값을 기반으로 성공/실패 판단
            if (response.data.httpStatusCode === 200) {
                console.log('인증 성공');
                return true; // 인증 성공
            } else if (response.data.httpStatusCode === 404) {
                console.log('인증 실패');
                return false; // 인증 실패
            }
        } catch (error) {
            // 네트워크 오류 또는 기타 예외 처리
            console.error('비밀번호 확인 요청 중 오류 발생:', error);
            alert('서버와 통신 중 문제가 발생했습니다. 다시 시도해주세요.');
            return false;
        }
    };
};

// 전화번호 바꾸는 로직
export const callChangePhoneAPI = ({ memberId, phoneNumber }) => {
    const requestURL = `http://localhost:8080/api/v1/member/modify/phone`;

    return async (dispatch, getState) => {
        const response = await api.put(requestURL, {
            memberId: memberId,
            phoneNumber: phoneNumber
        });

        console.log('서버에 잘 다녀왔나 response : ', response);

        if (response.data.httpStatusCode === 201) {
            console.log('전화번호 변경 성공');
        } else if (response.data.httpStatusCode === 404) {
            console.log('전화번호 변경 실패');
        }
    };
};

export const callChangePasswordAPI = ({ memberId, password }) => {
    const requestURL = `http://localhost:8080/api/v1/member/modify/password`;

    return async (dispatch, getState) => {
        const response = await api.put(requestURL, {
            memberId: memberId,
            password: password
        })
        console.log('마이페이지 비번 변경 서버 잘 다녀왔나 : ', response)

        if (response.data.httpStatusCode === 201) {
            console.log('비밀번호 변경 성공');
            return;
        } else if (response.data.httpStatusCode === 404) {
            console.log('전화번호 변경 실패');
            return;
        }
    }
}

export const callChangeAddressAPI = ({ memberId, address }) => {
    const requestURL = `http://localhost:8080/api/v1/member/modify/address`;

    return async (dispatch, getState) => {
        const response = await api.put(requestURL, {
            memberId: memberId,
            address: address
        })
        console.log('주소 변경 요청 서버에 잘 다녀 왔는지');

        if (response.data.httpStatusCode === 201) {
            console.log('주소 변경 성공');
            return;
        } else if (response.data.httpStatusCode === 404) {
            console.log('주소 변경 실패')
            return;
        }
    };
}

// 마이페이지에서 이미지 변경 요청
export const callChangeImageAPI = ({ memberId, imageLink }) => {
    const requestURL = `http://localhost:8080/api/v1/member/modify/imageLink`;

    console.log('callChangeImageAPI에 memberId 잘 넘어 오는지 : ', memberId);
    console.log('callChangeImageAPI에 imageLink 잘 넘어 오는지 : ', imageLink);

    return async (dispatch, getState) => {
        const formData = new FormData();

        // JSON 데이터 생성 (객체 형식으로 만들어 줘야 함!!)
        const memberData = {
            memberId: memberId, // 문자열 데이터
        };

        // FormData에 JSON 데이터 추가
        formData.append(
            "formData",
            new Blob([JSON.stringify(memberData)], { type: "application/json" })
        );

        // FormData에 파일 추가 (파일 객체 그대로 추가)
        formData.append("imageLink", imageLink);

        try {
            const response = await api.put(requestURL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('프로필 사진 변경 서버에 잘 다녀 왔는지 : ', response);

            if (response.data.httpStatusCode === 201) {
                console.log('프로필 사진 변경 성공');
                // alert('프로필 사진이 변경되었습니다.');
            } else if (response.data.httpStatusCode === 400) {
                console.log('프로필 사진 변경 실패');
                alert('프로필 사진 변경에 실패했습니다.');
            } else {
                console.error('예상치 못한 상태 코드:', response.data.httpStatusCode);
                alert('알 수 없는 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('프로필 사진 변경 중 오류 발생: ', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }

    };
};

// 탈퇴하기 눌렀을 때 동작하는 애 
export const callWithdrawAPI = ({ memberId }) => {
    const requestURL = `http://localhost:8080/api/v1/member/withdraw/${memberId}`;

    return async () => {
        const response = await api.put(requestURL)

        console.log('회원 탈퇴 요청 서버에 잘 다녀 왔나. response : ', response);
    };
}

export const callConvertImageAPI = ({ memberId, storeImage }) => {
    const requestURL = `http://localhost:8080/api/v1/member/modify/imageLink`;

    console.log('callChangeImageAPI에 memberId 잘 넘어 오는지 : ', memberId);
    console.log('callChangeImageAPI에 storaImage 잘 넘어 오는지 : ', storeImage);

    return async (dispatch, getState) => {
        const formData = new FormData();

        // JSON 데이터 생성 (객체 형식으로 만들어 줘야 함!!)
        const memberData = {
            memberId: memberId, // 문자열 데이터
        };

        // FormData에 JSON 데이터 추가
        formData.append(
            "formData",
            new Blob([JSON.stringify(memberData)], { type: "application/json" })
        );

        // FormData에 파일 추가 (파일 객체 그대로 추가)
        formData.append("storeImage", storeImage);

        try {
            const response = await api.put(requestURL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('프로필 사진 변경 서버에 잘 다녀 왔는지 : ', response);

            if (response.data.httpStatusCode === 201) {
                console.log('프로필 사진 변경 성공');
                // alert('프로필 사진이 변경되었습니다.');
            } else if (response.data.httpStatusCode === 400) {
                console.log('프로필 사진 변경 실패');
                alert('프로필 사진 변경에 실패했습니다.');
            } else {
                console.error('예상치 못한 상태 코드:', response.data.httpStatusCode);
                alert('알 수 없는 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('프로필 사진 변경 중 오류 발생: ', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }

    };
};

// 사용자가 제공자로 전환 신청할 때 서버에 넘길 사업자 데이터들
// export const callRegisterOwnerAPI = ({
//     memberId,
//     storeName,
//     bank,
//     account,
//     storeImage,
//     storeNo,
//     storeAddress,
//     storePhone,
//     attachmentFile // 변수명 수정
// }) => {
//     const requestURL = `http://localhost:8080/api/v1/member/owner/register`;

//     return async (dispatch, getState) => {
//         const formData = new FormData();

//         // JSON 데이터 생성
//         const ownerData = {
//             memberId: memberId,
//             storeName: storeName,
//             bank: bank,
//             account: account,
//             storeNo: storeNo,
//             storeAddress: storeAddress,
//             storePhone: storePhone
//         };

//         // FormData에 JSON 데이터 추가
//         formData.append(
//             "ownerData",
//             new Blob([JSON.stringify(ownerData)], { type: "application/json" })
//         );

//         // FormData에 이미지 파일 추가
//         if (storeImage instanceof File) {
//             formData.append("storeImage", storeImage);
//         }

//         // FormData에 첨부파일 추가 (필드 이름 수정)
//         if (attachmentFile instanceof File) {
//             formData.append("attachmentFile", attachmentFile); // 필드 이름 수정
//         }

//         try {
//             const response = await api.post(requestURL, formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });

//             console.log('제공자 전환 신청 서버 응답:', response);

//             if (response.data.httpStatusCode === 201) {
//                 console.log('제공자 전환 신청 성공');
//                 console.log('서버 응답 데이터:', response.data.results.result); // 추가

//                 // 성공적으로 데이터를 받아왔을 때 Redux 스토어에 저장
//                 dispatch({
//                     type: POST_OWNERDATA,
//                     payload: response.data.results.result // 서버에서 반환된 데이터 저장
//                 });

//                 return response;
//             } else if (response.data.httpStatusCode === 400) {
//                 console.log('제공자 전환 신청 실패');
//                 alert('제공자 신청에 실패했습니다.');
//             } else {
//                 console.error('예상치 못한 상태 코드:', response.data.httpStatusCode);
//                 alert('알 수 없는 오류가 발생했습니다.');
//             }
//         } catch (error) {
//             console.error('제공자 전환 신청 중 오류 발생:', error);
//             alert('서버와 통신 중 오류가 발생했습니다.');
//         }
//     };
// };
export const callRegisterOwnerAPI = ({
    memberId,
    storeName,
    bank,
    account,
    storeImage,
    storeNo,
    storeAddress,
    storePhone,
    attachmentFile
}) => {
    const requestURL = `http://localhost:8080/api/v1/member/owner/register`;

    return async (dispatch, getState) => {
        const formData = new FormData();

        // JSON 데이터 생성
        const ownerData = {
            memberId, storeName, bank, account, storeNo, storeAddress, storePhone
        };

        formData.append("ownerData", new Blob([JSON.stringify(ownerData)], { type: "application/json" }));

        if (storeImage instanceof File) {
            formData.append("storeImage", storeImage);
        }

        if (attachmentFile instanceof File) {
            formData.append("attachmentFile", attachmentFile);
        }

        try {
            const response = await api.post(requestURL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('제공자 전환 신청 서버 응답:', response);

            if (response.data.httpStatusCode === 201) {
                console.log('제공자 전환 신청 성공');
                console.log('서버 응답 데이터:', response.data.results.result);

                dispatch({
                    type: POST_OWNERDATA,
                    payload: response.data.results.result
                });

                return response; // 이 부분을 추가
            } else {
                console.error('예상치 못한 상태 코드:', response.data.httpStatusCode);
                return { success: false, error: '제공자 신청에 실패했습니다.' };
            }
        } catch (error) {
            console.error('제공자 전환 신청 중 오류 발생:', error);
            return { success: false, error: '서버와 통신 중 오류가 발생했습니다.' };
        }
    };
};


// // 사용자가 제공자 전환 신청을 했는지 여부 확인을 위함


// 재신청 시 돌아갈 구문
export const callUpdateOwnerAPI = ({
    memberId,
    storeName,
    bank,
    account,
    storeImage,
    storeNo,
    storeAddress,
    storePhone,
    attachmentFile
}) => {
    const requestURL = `http://localhost:8080/api/v1/member/owner/update`;

    return async (dispatch, getState) => {
        const formData = new FormData();

        const ownerData = {
            memberId, storeName, bank, account, storeNo, storeAddress, storePhone
        };

        formData.append("ownerData", new Blob([JSON.stringify(ownerData)], { type: "application/json" }));

        if (storeImage instanceof File) {
            formData.append("storeImage", storeImage);
        }

        if (attachmentFile instanceof File) {
            formData.append("attachmentFile", attachmentFile);
        }

        try {
            const response = await api.post(requestURL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('제공자 전환 재신청 서버 응답:', response);

            if (response.data.httpStatusCode === 201) {
                console.log('제공자 전환 재신청 성공');
                console.log('서버 응답 데이터:', response.data.results.result);

                dispatch({
                    type: POST_OWNERDATA,
                    payload: response.data.results.result
                });

                return response; // 이 부분을 추가
            } else {
                console.error('예상치 못한 상태 코드:', response.data.httpStatusCode);
                return { success: false, error: '제공자 재신청에 실패했습니다.' };
            }
        } catch (error) {
            console.error('제공자 전환 재신청 중 오류 발생:', error);
            return { success: false, error: '서버와 통신 중 오류가 발생했습니다.' };
        }
    };
};



// 사용자가 제공자 전환 신청을 했는지 여부 확인을 위함
export const checkOwnerStatusAPI = async (memberId) => {
    const requestURL = `http://localhost:8080/api/v1/member/owner/status/${memberId}`;
    try {
        const response = await api.get(requestURL);
        console.log('사용자가 제공자 전환 신청을 했는지 여부 : ', response);
        return response;
    } catch (error) {
        console.error('기존 신청 여부 확인 중 오류 발생:', error);
        throw error;
    }
};

// 제공자 전환 심사 반려 됐을 때 반려 메시지 가져오기
export const getRejectedMessage = async (memberId) => {
    const requestURL = `http://localhost:8080/api/v1/member/rejected/${memberId}`;
    try {
        const response = await api.get(requestURL);
        console.log('반려 메시지 잘 불러와졌나 :', response);
        return response;
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
    }
}

// 제공자 정보 불러오기 (예진)
export function getOwnerInfo({ ownerNo }) {
    return async (dispatch, getState) => {

        const url = `/owner/${ownerNo}`

        const response = await api.get(url)

        console.log("제공자 정보 : ", response)

        if (response?.data.httpStatusCode == 200) {

            dispatch({
                type: GET_OWNERINFO,
                payload: {
                    ownerInfo: response.data.results.result
                }
            });
        }
    }
}


// 회원의 대한 정보를 불러오는 구문(은미)
export async function getMemberData(memberId) {

    const url = `/member/${memberId}`

    const response = await getData(url);

    return response;
};

// 은미
const getData = async (url, query) => {
    let response

    if (!query) {
        response = await api.get(url)
    } else {
        response = await api.get(url, { params: query })
    }

    return response?.data
}

export function changeConsultingAPI({ memberId }) {
    console.log("업데이트 전 : ", memberId)
    const url = `/member/modify/consulting?memberId=${memberId}`

    return async (dispatch, getState) => {
        const response = await api.put(url)

        console.log("변환 결과 : ", response)

        if (response?.data.httpStatusCode == 204) {
            dispatch({
                type: CHANGE_ISCONSULTING,
                payload: {
                    isConsulting: response?.data.results.isConsulting
                }
            })
        }
    };
}


// 제공자 전환 심사 중복된 사업자번호인지 확인하기
export const getCheckStoreNoAPI = async (memberId, storeNo) => {
    const requestURL = `http://localhost:8080/api/v1/member/check-store-no`;
    try {
        // 요청 파라미터를 params 객체로 전달
        const response = await api.get(requestURL, {
            params: { memberId, storeNo },
        });
        console.log('중복 여부 storeNo 잘 불러와졌나 :', response);
        return response;
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
    }
};
