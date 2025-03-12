import OrdersCss from './orders.module.css';
import { useState, useEffect } from 'react';
import { getUserOrderList } from '../../apis/RentalAPI';
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import Pagination from '../../component/Pagination';
import { useNavigate } from 'react-router-dom';

function Orders() {

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    // 데이터 관리
    const [orderList, setOrderList] = useState([]); // 사용자별 주문 리스트

    // 검색 데이터 관리
    const [searchOrder, setSearchOrder] = useState({
        period: 'ALL',     // period=1MONTH, 3MONTH
        searchDate: ''  // searchDate=2025-02-06
    });
    
    // 페이징 상태 관리
    const [pageInfo, setPageInfo] = useState(null);  // pageInfo 상태 추가
    const [pageNum, setPageNum] = useState(1);  // pageNum 상태 관리 


    async function getData(memberId, period, searchDate, pageNum) {
        try {
            const data = await getUserOrderList(memberId, period, searchDate, pageNum);
            console.log('data', data);
    
            // data.results가 없으면 빈 배열로 설정
            if (!data || !data.results || !data.results.userOrderList) {
                setOrderList([]); // 빈 배열로 설정
                setPageInfo(null); // 페이지 정보도 없으므로 null로 설정
                return;
            }
    
            const orders = data.results.userOrderList;
            const pageInfo = data.results.pageInfo;

            setOrderList(orders); // 주문 목록 설정
            setPageInfo(pageInfo); // 페이지 정보 설정
    
        } catch (error) {
            console.error('주문 내역 불어오기 실패 :', error);
        }
    }

    // 페이지 변경 시 데이터 가져오기
    const handlePageChange = (newPageNum) => {
        setPageNum(newPageNum);  // pageNum 변경
    };


    // 검색 조건 변경 시 데이터 다시 불러오기
    useEffect(() => {
        getData(memberId, searchOrder.period, searchOrder.searchDate, pageNum);
    }, [memberId, searchOrder, pageNum]);

 
    // 기간 선택 핸들러
    const handleChange = (period) => {
        if (period === 'ALL') {
            setSearchOrder({
                period: 'ALL',
                searchDate: ''
            });
        } else {
            setSearchOrder((prev) => ({
                ...prev,
                period: period,
                searchDate: '' 
            }));
        }
    };

    // 날짜 변경 핸들러
    const handleDateChange = (event) => {
        setSearchOrder((prev) => ({
            ...prev,
            period: '', 
            searchDate: event.target.value
        }));
    };

    // 숫자를 1,000 형식으로 변환
    const formatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) {
        return "0";  // 값이 없거나 숫자가 아니면 기본값 0 반환
    }
    return num.toLocaleString();
    };

    const navigate = useNavigate();

    const handleInquiryClick = (item) => {
        navigate(`/product/${item}`);
    };

    return (
        <div className={OrdersCss.ordersContainer}>
            <div className={OrdersCss.orderPageTitle}>주문/배송</div>
            <div className={OrdersCss.rentalPeriodSelector}>
                <div
                    onClick={() => handleChange('ALL')}
                    className={searchOrder.period === 'ALL' ? OrdersCss.selected : ''}
                >
                    전체
                </div>
                <div
                    onClick={() => handleChange('1MONTH')}
                    className={searchOrder.period === '1MONTH' ? OrdersCss.selected : ''}
                >
                    1개월
                </div>
                <div
                    onClick={() => handleChange('3MONTH')}
                    className={searchOrder.period === '3MONTH' ? OrdersCss.selected : ''}
                >
                    3개월
                </div>
                <div className={searchOrder.searchDate.length > 0 ? OrdersCss.selectedDateContainer : OrdersCss.dateContainer}>
                    <input 
                        type="date" 
                        value={searchOrder.searchDate} 
                        onChange={handleDateChange} 
                    />
                </div>
            </div>
            <div className={OrdersCss.orderListContainer}>

                {/* 테이블 데이터 */}
                {orderList.length === 0 ? (
                    <div>
                        <p>예약 내역이 없습니다.</p>
                    </div>
                ) : (
                    orderList.map((item) => (
                        <>
                            <div className={OrdersCss.orderListItem}>
                                <div className={OrdersCss.status}>
                                    <div>
                                        {item.rentalState === '예약완료' ? `${item.rentalState} (배송준비중)` : item.rentalState}
                                    </div>
                                </div>
                                <div className={OrdersCss.statusAndProductImgBox}>
                                    <div className={OrdersCss.productImg}>
                                        <img src={item?.productImageLink == "a.jpg" || item?.productImageLink == "default.jpg" || item?.productImageLink == null ? require("../../assets/images/default.jpg") :item?.productImageLink}
                                        alt="프로필 이미지" />
                                    </div>
                                    <div className={OrdersCss.ordersInfo}>
                                        <div>주문번호 : {item.rentalNo}</div>
                                        <div>{item.orderDate} 결제</div>
                                        <div>상품명 : {item.productName}</div>
                                        <div>{formatNumber((item.rentalPrice * item.rentalNumber)* 0.9)} 원</div>
                                        <div>
                                            <Link to={`/mypage/orders/${item.rentalNo}`} className={OrdersCss.link}>주문상세 &gt;</Link>
                                        </div>
                                    </div>
                                    <div className={OrdersCss.inquiryButton}>
                                    <div 
                                        className={OrdersCss.inquiryButton}
                                        onClick={() => handleInquiryClick(item.productNo)}
                                    >
                                            문의하기
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))
                )
                }
            </div>

            {/* 페이징 컴포넌트 가져오기 */}
            {pageInfo && (
            <div className={OrdersCss.pagingContainer}>
                <div>
                    <Pagination 
                    pageInfo={pageInfo} 
                    onPageChange={handlePageChange} 
                    />
                </div>
            </div>
            )}
        </div>

    );

}

export default Orders