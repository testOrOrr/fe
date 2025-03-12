import { useEffect, useState } from "react";
import ReviewCss from './reviewProduct.module.css';
import ReviewDiv from '../../pages/admin/rental.module.css';
import { callReviewByProductNoAPI } from "../../apis/ReviewAPI";

function Review({ productInfo  , setReviewsCount }) {
    const [reviews, setReviews] = useState([]);

    // 리뷰 데이터를 가져오는 함수
    const fetchReviews = async () => {
        try {
            const response = await callReviewByProductNoAPI(productInfo.productNo);
            console.log("리뷰 데이터:", response);

            if (response?.results) {
                setReviews(response.results?.map);
                setReviewsCount(response.results.map.length); // 리뷰 개수 상태 업데이트
            }
        } catch (error) {
            console.error("리뷰 데이터 가져오기 실패:", error);
        }
    };

    // 컴포넌트가 마운트될 때 리뷰 데이터를 가져옴
    useEffect(() => {
        if (!productInfo?.productNo) return;
        fetchReviews();
    }, [productInfo]);

    return (
        <>
        <div className={ReviewDiv.adminRentalContent}>
            <div className={ReviewCss.reviewBox}>
                <h3>상품 리뷰 <span style={{ color: 'blue' }}>({reviews.length})</span></h3>

                {/* 리뷰 리스트 */}
                <div className={ReviewCss.reviewList}>
                    {reviews.length === 0 ? (
                        <p>리뷰 내역이 없습니다.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.reviewNo} className={ReviewCss.reviewItem}>
                                {/* 리뷰 헤더 */}
                                <div className={ReviewCss.reviewHeader}>
                                    <span>{'⭐'.repeat(Math.round(review.score))} || </span> {/* 별점 표시 */}
                                    <span>{review.userName || '익명'} || </span>
                                    <span>{new Date(review.reviewWriteTime).toLocaleDateString()}</span>
                                </div>

                                {/* 리뷰 본문 */}
                                <div className={ReviewCss.reviewContent}>
                                    <p>{review.reviewContent}</p>
                                </div>

                                {/* 추가 정보 */}
                                <div className={ReviewCss.reviewMeta}>
                                    <span>상품명: {review.productName} || </span>

                                    <span>대여 기간: {review.rentalTerm}개월</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default Review;
