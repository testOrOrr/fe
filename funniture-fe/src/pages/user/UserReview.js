import Pagination from "../../component/Pagination";
import myPageReview from "./mypagereview.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callWritableReviewsAPI, callWrittenReviewsAPI , callSubmitReviewAPI} from "../../apis/ReviewAPI";
import defaultImage from "../../assets/images/default.jpg";
import BtnModal from "../../component/BtnModal";
import { useNavigate } from "react-router-dom";

function UserReview() {
    const user = useSelector((state) => state.member.user);
    const writableReviews = useSelector((state) => state.member.writableReviews?.result?.data || []);
    console.log('UserReview 컴포넌트 writableReviews : ', writableReviews);
    const writtenReviews = useSelector((state) => state.member.writtenReviews?.result?.data || []);
    console.log('UserReview 컴포넌트 : writtenReviews', writtenReviews);
    const writablePageInfo = useSelector((state) => state.member?.writablePageInfo);
    console.log('UserReview 컴포넌트 : writablePageInfo', writablePageInfo);
    const writtenPageInfo = useSelector((state) => state.member?.writtenPageInfo);
    console.log('UserReview 컴포넌트 : writtenPageInfo', writtenPageInfo);

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const [currentWritablePage, setCurrentWritablePage] = useState(1);
    const [currentWrittenPage, setCurrentWrittenPage] = useState(1);
    const [activeTab, setActiveTab] = useState("writable"); // "writable" or "written"

    // 리뷰 작성 모달 상태
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewContent, setReviewContent] = useState("");
    const [score, setScore] = useState(5); // 초기 별점
    const [showCompleteModal, setShowCompleteModal] = useState(false); // 리뷰 등록 완료 모달 상태

    const [showWarningModal, setShowWarningModal] = useState(false);

    // 작성 가능한 리뷰 데이터 로드
    useEffect(() => {
        if (user?.memberId && currentWritablePage > 0) {
            dispatch(callWritableReviewsAPI(user.memberId, currentWritablePage));
        }
    }, [user?.memberId, currentWritablePage]);

    // 작성한 리뷰 데이터 로드
    useEffect(() => {
        if (user?.memberId && currentWrittenPage > 0) {
            dispatch(callWrittenReviewsAPI(user.memberId, currentWrittenPage));
        }
    }, [user?.memberId, currentWrittenPage]);

    // 페이지 변경 핸들러
    const onWritablePageChange = (pageNum) => setCurrentWritablePage(pageNum);
    const onWrittenPageChange = (pageNum) => setCurrentWrittenPage(pageNum);

    // 리뷰 작성 버튼 클릭 핸들러
    const handleWriteReviewClick = (product) => {
        setSelectedProduct(product); // 선택된 상품 정보 저장
        setShowReviewModal(true); // 모달 열기
        setScore(5); // 별점 초기화
        setReviewContent(""); // 리뷰 내용 초기화
    };

    // 별점 조정 핸들러 (0.5 단위)
    const handleScoreChange = (change) => {
        let newScore = score + change;
        if (newScore >= 0.5 && newScore <= 5) {
            setScore(newScore);
        }
    };

    // 리뷰 제출 핸들러
    const handleSubmitReview = async () => {
        if (!selectedProduct || !user) return;

        if (!reviewContent.trim()) { 
            setShowWarningModal(true); // 경고 모달 열기
            return;
        }

        const reviewData = {
            productNo: selectedProduct.productNo,
            memberId: user.memberId,
            score,
            reviewContent,
        };

        await dispatch(callSubmitReviewAPI(reviewData));

        dispatch(callWritableReviewsAPI(user.memberId, currentWritablePage));
        dispatch(callWrittenReviewsAPI(user.memberId, currentWrittenPage));

        setShowReviewModal(false); 
        setShowCompleteModal(true); 
    };

    // 재구매 버튼 클릭 핸들러
    const handleRebuyClick = (productNo) => {
        navigate(`/product/${productNo}`);
    };
    

    return (
        <>
            <div className={myPageReview.activeContainer}>
                {/* 제목 */}
                <div className={myPageReview.activeInquiryTitle}>
                    <div>리뷰 관리</div>
                </div>

                {/* 탭 버튼 */}
                <div className={myPageReview.tabContainer}>
                    <button
                        className={`${myPageReview.tabButton} ${activeTab === "writable" ? myPageReview.activeTab : ""}`}
                        onClick={() => setActiveTab("writable")}
                    >
                        작성 가능한 리뷰 ({writableReviews?.length || 0})
                    </button>
                    <button
                        className={`${myPageReview.tabButton} ${activeTab === "written" ? myPageReview.activeTab : ""}`}
                        onClick={() => setActiveTab("written")}
                    >
                        작성한 리뷰 ({writtenReviews?.length || 0})
                    </button>
                </div>

                {/* 탭 내용 */}
                <div className={myPageReview.reviewListContainer}>
                    {activeTab === "writable" && writableReviews?.length > 0 ? (
                        writableReviews.map((review, index) => (
                            <div key={index} className={myPageReview.reviewCard}>
                                <img
                                    src={
                                        review.productImageLink?.includes("cloudinary.com")
                                            ? review.productImageLink
                                            : defaultImage
                                    }
                                    alt="상품 이미지"
                                    className={myPageReview.productImage}
                                />
                                <div className={myPageReview.reviewContent}>
                                    <p>{new Date(review.orderDate).toLocaleDateString()} 결제</p>
                                    <h3>{review.productName}</h3>
                                    <p>{review.rentalTerm}개월</p>
                                    <p>{review.rentalPrice}원</p>
                                </div>
                                <div className={myPageReview.actionButtons}>
                                    <button
                                            className={myPageReview.writeButton}
                                            onClick={() => handleWriteReviewClick(review)} // 리뷰 작성 버튼 클릭 시 실행
                                        >
                                            리뷰작성
                                    </button>
                                    <button className={myPageReview.repurchaseButton}
                                            onClick={() => handleRebuyClick(review.productNo)}
                                    >재구매</button>
                                    <button className={myPageReview.deleteButton}>삭제</button>
                                </div>
                            </div>
                        ))
                    ) : activeTab === "writable" ? (
                        <p>작성 가능한 리뷰가 없습니다.</p>
                    ) : writtenReviews?.length > 0 ? (
                        writtenReviews.map((review, index) => (
                            <div key={index} className={myPageReview.reviewCard}>
                                <img
                                    src={
                                        review.productImageLink?.includes("cloudinary.com")
                                            ? review.productImageLink
                                            : defaultImage
                                    }
                                    alt="상품 이미지"
                                    className={myPageReview.productImage}
                                />
                                <div className={myPageReview.reviewContent}>
                                    <h3>{review.productName}</h3>
                                    <h6>{review.reviewWriteTime}</h6>
                                    <div className={myPageReview.reviewScore}>
                                    <span style={{ color: 'yellow' }}>{"★".repeat(Math.round(review.score))}{" "}</span>
                                        <span>{review.score.toFixed(1)}</span>
                                    </div>
                                    <p style={{marginTop:'10px'}}>{review.reviewContent}</p>
                                </div>
                                <div className={myPageReview.actionButtons}>
                                    <button className={myPageReview.repurchaseButton}
                                            onClick={() => handleRebuyClick(review.productNo)}
                                    >재구매</button>
                                    <button className={myPageReview.deleteButton}>삭제</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>작성된 리뷰가 없습니다.</p>
                    )}
                </div>

                {/* Pagination Component */}
                {activeTab === "writable" && writablePageInfo && (
                    <Pagination pageInfo={writablePageInfo} onPageChange={onWritablePageChange} />
                )}
                {activeTab === "written" && writtenPageInfo && (
                    <Pagination pageInfo={writtenPageInfo} onPageChange={onWrittenPageChange} />
                )}

                    {/* BtnModal 활용 */}
                    {showReviewModal && selectedProduct && (
                    <BtnModal
                        showBtnModal={showReviewModal}
                        setShowBtnModal={setShowReviewModal}
                        modalTitle="리뷰 작성"
                        btnText="등록"
                        secondBtnText="취소"
                        onSuccess={handleSubmitReview} // 등록 버튼 클릭 시 실행
                        onFail={() => setShowReviewModal(false)} // 취소 버튼 클릭 시 실행
                        modalContext={
                            <>
                                <div style={{ textAlign: "center" }}>
                                    <img
                                        src={
                                            selectedProduct.productImageLink?.includes("cloudinary.com")
                                                ? selectedProduct.productImageLink
                                                : defaultImage
                                        }
                                        alt="상품 이미지"
                                        style={{ width: "100px", height: "100px", marginBottom: "10px" }}
                                    />
                                    <h4>{selectedProduct.productName}</h4>
                                </div>
                                <div style={{ marginTop: "20px", textAlign: "center" }}>
                                    <label>별점:</label>
                                    <button onClick={() => handleScoreChange(-0.5)} disabled={score <= 0.5}>-</button>
                                    <span style={{ margin: "0 10px" }}>{score.toFixed(1)}</span>
                                    <button onClick={() => handleScoreChange(0.5)} disabled={score >= 5}>+</button>
                                </div>
                                <textarea
                                    placeholder="상품평을 입력해주세요."
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    style={{ width: "100%", height: "100px", marginTop: "10px" }}
                                />
                            </>
                        }
                    />
                )}

                    {/* 완료 모달 */}
                    {showCompleteModal && (
                    <BtnModal
                        showBtnModal={showCompleteModal}
                        setShowBtnModal={setShowCompleteModal}
                        modalTitle="리뷰 등록 완료"
                        btnText="확인"
                        modalContext={<p>리뷰 등록이 완료되었습니다!</p>}
                    />
                    )}
                    {/* 상품평 미입력 경고 모달 추가 */}
                    {showWarningModal && (
                        <BtnModal
                            showBtnModal={showWarningModal}
                            setShowBtnModal={setShowWarningModal}
                            modalTitle="알림"
                            btnText="확인"
                            modalContext={<p>상품평을 작성해 주세요!</p>}
                        />
                    )}
            </div>
        </>
    );
}

export default UserReview;
