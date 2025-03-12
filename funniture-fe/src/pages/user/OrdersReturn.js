import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OrdersReturnCSS from './ordersReturn.module.css';
import Pagination from '../../component/Pagination';
import { getActiveRentalList } from '../../apis/RentalAPI';

function OrdersReturn() {

    // 반납 요청 페이지로 보내기위해 useNavigate() 사용
    const navigate = useNavigate();

    const handleReturnRequest = (rentalNo) => {
        // 반납신청 클릭 시, 이동할 경로로 페이지 이동
        navigate(`/mypage/return/${rentalNo}`);  // '/return-request'는 이동할 페이지의 경로입니다.
    };

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    // 페이징 상태 관리
    const [pageInfo, setPageInfo] = useState(null);  // pageInfo 상태 추가
    const [pageNum, setPageNum] = useState(1);  // pageNum 상태 관리 

    // 페이지 변경 핸들러
    const handlePageChange = (newPageNum) => {

        setPageNum(newPageNum);  // pageNum 변경
    };

    // 데이터 관리
    const [activeRentalList, setActiveRentalList] = useState([]);   // 제공자별 예약 리스트

    // 데이터 가져오는 함수
    async function getData(memberId, pageNum) {
        try {
            const data = await getActiveRentalList(memberId, pageNum);
            const rentals = data.results.activeRentalList;
            console.log('rentals', rentals);
            const pageInfo = data.results.pageInfo;
            setActiveRentalList(rentals);
            setPageInfo(pageInfo);

        } catch (error) {
            console.error('Error fetching rentals list:', error);
            setActiveRentalList([]);
        }
    }

    // 검색 조건 변경 시 데이터 다시 불러오기
    useEffect(() => {
        getData(memberId, pageNum);
    }, [memberId, pageNum]);  // pageInfo 제거하고, period, rentalTab, pageNum만 의존성으로 설정


    return(
        <div className={OrdersReturnCSS.activeContainer}>
            <div className={OrdersReturnCSS.activeRentalTitle}>
                <div>사용상품/반납</div>
            </div>

            <div className={OrdersReturnCSS.activeRentalContainer}>
                <table className={OrdersReturnCSS.activeRentalTable}>
                    <thead>
                        <tr>
                            <th style={{ width: "10%" }}>주문번호</th>
                            <th style={{ width: "24%" }}>상품명</th>
                            <th style={{ width: "5%" }}>수량</th>
                            <th style={{ width: "10%" }}>약정기간</th>
                            <th style={{ width: "8%" }}>A/S</th>
                            <th style={{ width: "28%" }}>사용 날짜 / 만료 날짜</th>
                            <th style={{ width: "15%" }}>반납신청</th>
                        </tr>
                    </thead>
                    <tbody>
                    {activeRentalList.length > 0 ? (
                        activeRentalList.map((activeRental, index) => {
                            const rentalEndDate = new Date(`${activeRental.rentalEndDate}T00:00:00`); // 시간 명시
                            const currentDate = new Date();
                            currentDate.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 맞춤
                            const daysRemaining = Math.floor((rentalEndDate - currentDate) / (1000 * 60 * 60 * 24));
                            
                            return (
                                <tr key={activeRental.rentalNo || index}>
                                    <td>{activeRental.rentalNo}</td>
                                    <td>{activeRental.productName}</td>
                                    <td>{activeRental.rentalNumber}</td>
                                    <td>{activeRental.rentalTerm}개월</td>
                                    <td>{activeRental.asNumber}</td>
                                    <td>{activeRental.rentalStartDate}~{activeRental.rentalEndDate}</td>
                                    <td>
                                        {/* rentalEndDate가 현재 날짜에서 7일 전부터 오늘 날짜까지인 경우에만 반납신청 div 보이기 */}
                                        {daysRemaining <= 7 && daysRemaining >= 0 ? (
                                            <div onClick={() => handleReturnRequest(activeRental.rentalNo)}>반납신청</div>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center" }}>예약된 데이터가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* 페이징 컴포넌트 가져오기 */}
            <div className={OrdersReturnCSS.pagingContainer}>
                <div>
                    <Pagination
                        pageInfo={pageInfo}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}


export default OrdersReturn