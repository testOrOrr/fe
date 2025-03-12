import { useEffect } from 'react';
import myPageInquiry from './mypageInquiry.module.css';
import { callAllInquiryByMypageAPI , getAnswerByInquiryNoAPI } from '../../apis/InquiryAPI';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '../../component/Pagination';
import { useState } from 'react';
import BtnModal from '../../component/BtnModal';
import { COMMENT_SELECT } from '../../redux/modules/MemberModule';

function UserInquiry() {

    // 25-03-08 일단 사용자 마이페이지 문의 불러오고, 스토어에 저장했음!!!
    const user = useSelector(state => state.member);
    console.log('UserInquiry의 user : ', user);
    const inquiries = useSelector(state => state.member?.inquiries);
    console.log('UserInquiry의 inquiries : ', inquiries);
    const pageInfo = useSelector(state => state.member?.pageInfo);
    console.log('UserInquiry의 pageInfo : ', pageInfo);

    const comment = useSelector((state) => state.member?.comment);
    console.log('마이페이지 comment : ' , comment);

    const dispatch = useDispatch();

    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 관리
    const [showModal, setShowModal] = useState(false); // 모달 상태 관리
    const [modalTitle, setModalTitle] = useState(''); // 모달 제목
    const [modalContent, setModalContent] = useState(''); // 모달 내용
    const [selectedInquiryNo, setSelectedInquiryNo] = useState(''); // 선택된 문의 번호

    // 서버에서 데이터를 불러오는 함수
    const fetchInquiries = async (page) => {
        try {
            await dispatch(callAllInquiryByMypageAPI(user?.user?.memberId, page)); // Redux에 저장됨
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
        }
    };

    // 초기 데이터 로드 및 페이지 변경 시 데이터 로드
    useEffect(() => {
        if (user.user.memberId && currentPage > 0) {
            fetchInquiries(currentPage); // 데이터 로드
        }
    }, [user.user.memberId, currentPage]); // 의존성 배열 최소화

    // 페이지 변경 핸들러
    const onPageChange = (pageNum) => {
        if (pageNum !== currentPage) { // 현재 페이지와 다른 경우에만 상태 업데이트
            setCurrentPage(pageNum);
        }
    };

    // 답변 완료된 데이터 클릭 이벤트 핸들러
    const handleAnswerClick = async (inquiryNo) => {
        setSelectedInquiryNo(inquiryNo);
        try {
            const response = await getAnswerByInquiryNoAPI(inquiryNo)();
            console.log('사용자 페이지 문의 답변 조회 response : ', response);
            if (response) {
                setModalTitle('답변 확인');
                const inquiryData = inquiries?.result?.data?.find((inquiry) => inquiry.inquiryNo === inquiryNo);
    
                // 문의 유형 매핑
                const qnaTypeMap = {
                    1: '기간 문의',
                    2: '가격 문의',
                    3: '기타 문의'
                };
    
                if (inquiryData) {
                    setModalContent(
                        <div className={myPageInquiry.modalContentContainer}>
                            {/* 상품 정보 섹션 */}
                            <div className={myPageInquiry.productInfo}>
                                <img
                                    src={inquiryData.productImageLink}
                                    alt="상품 이미지"
                                    className={myPageInquiry.productImage}
                                />
                                <div className={myPageInquiry.productDetails}>
                                    <p>◑ 상품 ID : {inquiryData.productNo}</p>
                                    <p>◑ 상품명 : {inquiryData.productName}</p>
                                </div>
                            </div>
                            
                            {/* 문의 정보 섹션 */}
                            <div className={myPageInquiry.answerSection}>
                                <p>◑ 문의 유형 : {qnaTypeMap[inquiryData.qnaType]}</p>
                                <p>◑ 문의 내용 : {inquiryData.inquiryContent}</p>
                                <p>◑ 문의 등록 시간 : {inquiryData.qnaWriteTime}</p>
                            </div>
    
                            <hr/>
    
                            {/* 답변 정보 섹션 */}
                            <div className={myPageInquiry.answerSection}>
                                <p className="answerContent">◐ 답변 내용 : {response.results?.map?.commentContent}</p>
                                <p>◐ 답변 등록 시간 : {response.results?.map?.commentWriteTime}</p>
                            </div>
                        </div>
                    );
                } else {
                    setModalContent(<div>문의 데이터를 찾을 수 없습니다.</div>);
                }
                setShowModal(true);
                dispatch({ type: COMMENT_SELECT, payload: response }); // 제공자가 남긴 문의 답변을 스토어에 저장!!!

            }
        } catch (error) {
            console.error('답변 내용 불러오기 실패:', error);
        }
    };
    



    return (
        <>
            <div className={myPageInquiry.activeContainer}>
                <div className={myPageInquiry.activeInquiryTitle}>
                    <div>문의 관리</div>
                </div>

                <div className={myPageInquiry.activeRentalContainer}>
                    <table className={myPageInquiry.activeRentalTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "10%" }}>문의 번호</th>
                                <th style={{ width: "23%" }}>문의 유형</th>
                                <th style={{ width: "20%" }}>등록일</th>
                                <th style={{ width: "10%" }}>상품번호</th>
                                <th style={{ width: "24%" }}>상품명</th>
                                <th style={{ width: "13%" }}>등록 상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries?.result?.data?.length > 0 ? (
                                inquiries.result.data.map((inquiry) => (
                                    <tr key={inquiry.inquiryNo}>
                                    <td>{inquiry.inquiryNo}</td>
                                    <td>{inquiry.qnaType === 1 ? '기간 문의' : inquiry.qnaType === 2 ? '가격 문의' : '기타 문의'}</td>
                                    <td>{inquiry.qnaWriteTime}</td>
                                    <td>{inquiry.productNo}</td>
                                    <td>{inquiry.productName}</td>
                                    <td>
                                        {inquiry.answerStatus === 'complete' ? (
                                            <button
                                            className={`${myPageInquiry.answerButton} ${myPageInquiry.complete}`}
                                            onClick={() => handleAnswerClick(inquiry.inquiryNo)}
                                            >
                                                답변 완료
                                            </button>
                                        ) : (
                                            <button className={`${myPageInquiry.answerButton} ${myPageInquiry.waiting}`}>
                                                답변 대기
                                            </button>
                                        )}
                                    </td>
                                    </tr>
                                ))
                            ) : (
                                // 데이터가 없을 경우 표시할 내용
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>
                                        등록한 문의내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {pageInfo && (
                    <Pagination
                        pageInfo={pageInfo}
                        onPageChange={onPageChange}
                    />
                )}
            </div>

                {/* 모달 컴포넌트 */}
                <BtnModal
                showBtnModal={showModal}
                setShowBtnModal={setShowModal}
                modalTitle={modalTitle}
                modalContext={modalContent}
                btnText="확인"
                secondBtnText=""
                onSuccess={() => setShowModal(false)}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}

export default UserInquiry;