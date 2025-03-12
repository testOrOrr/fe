import Pagination from '../../component/Pagination';
import OwnerReviewCSS from './ownerReview.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { callReviewByOwnerNoAPI } from '../../apis/ReviewAPI';

function OwnerReview() {

    const { user } = useSelector(state => state.member);
    const ownerReview = useSelector(state => state.owner?.reviews?.result || []);
    console.log('ownerReview : ' , ownerReview);
    const pageInfo = useSelector(state => state.owner?.pageInfo || null);  
    console.log('pageInfo', pageInfo);
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); 

    useEffect(() => {
        if (user && user.memberId) {
            fetchReviews(currentPage); 
        }
    }, [user, currentPage]);

    const fetchReviews = async (page) => {
        setIsLoading(true);
        try {
            await dispatch(callReviewByOwnerNoAPI(user.memberId, page));  
            setCurrentPage(page);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("Updated pageInfo:", pageInfo);
    }, [pageInfo]);

    return (
        <>
            <div className={OwnerReviewCSS.wholeContainer}>
                <div className={OwnerReviewCSS.title}>리뷰 관리</div>

                {/* 테이블 */}
                <table className={OwnerReviewCSS.table}>
                    <thead>
                        <tr>
                            <th>접수일</th>
                            <th>고객명</th>
                            <th>고객번호</th>
                            <th>리뷰 번호</th>
                            <th>상품 번호</th>
                            <th>상품명</th>
                            <th>리뷰 내용</th>
                            <th>평점</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ownerReview.data && ownerReview.data.length > 0 ? (
                            ownerReview.data.map((review, index) => (
                                <tr key={index}>
                                    <td>{review.reviewWriteTime}</td>
                                    <td>{review.userName}</td>
                                    <td>{review.memberId}</td>
                                    <td>{review.reviewNo}</td>
                                    <td>{review.productNo}</td>
                                    <td>{review.productName}</td>
                                    <td>{review.reviewContent}</td>
                                    <td>{review.score}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    등록된 리뷰내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className={OwnerReviewCSS.paginationWrapper}>
                {pageInfo && (
                    <Pagination style={{marginLeft:'35% !important'}}
                        pageInfo={pageInfo}
                        onPageChange={(pageNum) => {
                            setCurrentPage(pageNum); 
                            fetchReviews(pageNum); 
                        }}
                    />
                )}
            </div>
            </div>
        </>
    );
}

export default OwnerReview;
