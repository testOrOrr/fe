    import axios from 'axios';
    import decodeJwt from '../utils/tokenUtils';

const MONGO_URL = process.env.REACT_APP_MONGO_URL;
const BACK_PROXY = process.env.REACT_APP_BACKEND_PROXY;
const LOCAL_BACKEND = process.env.REACT_APP_LOCAL_BACKEND;


    const api = axios.create({
        // baseURL: `${REACT_APP_PROD_BACKEND}/api`,
        baseURL: LOCAL_BACKEND,
        // REACT_APP_LOCAL_BACKEND=http://localhost:5000/api
        // baseURL: MONGO_URL,
        // baseURL: `${BACK_PROXY}`,
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
            authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
        },
    });

    // 이미지 파일 전송용 Axios 인스턴스
    const imageApi = axios.create({
        baseURL: LOCAL_BACKEND,
        headers: {
            Accept: '*/*', // 모든 응답 허용
            authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
        },
    });

    // 아래 구문은 axios에서 제공하는 것들로 신경안 써도 됨
    api.interceptors.request.use(
        (request) => {
            // console.log('Starting Request', request);
            request.headers.authorization = `Bearer ${localStorage.getItem('accesstoken')}`;
            return request;
        },
        function (error) {
            console.log('REQUEST ERROR', error);
        },
    );

    api.interceptors.response.use(
        (response) => {
            return response;
        },
        function (error) {
            error = error.response;
            console.log('RESPONSE ERROR', error);
            return Promise.reject(error);
        },
    );

    export default api;
