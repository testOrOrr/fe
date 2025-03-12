import './mypage.css'
import profileImg from '../../assets/images/profiletest.jpg'
import { Outlet } from "react-router-dom"
import sackDollarIcon from "../../assets/icon/sack-dollar-solid.svg";
import clockRotateIcon from "../../assets/icon/clock-rotate-left-solid.svg";
import truckIcon from "../../assets/icon/truck-solid.svg";
import checkIcon from "../../assets/icon/check-solid.svg";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getPointList,getCurrentPoint } from '../../apis/PointAPI';
import { getRentalStateList, getActiveRentalList } from '../../apis/RentalAPI';
import { useSelector } from 'react-redux';

function MyPage() {

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    const [activeTab, setActiveTab] = useState('orders');

    // 데이터 관리
    const [pointLogs, setPointLogs] = useState([]);   
    const [point, setPoint] = useState([]);  
    const [rentalState, setRentalState] = useState([]); 
    const [returnDeadlineCount, setReturnDeadlineCount] = useState(0);    // 반납 마감 임박 상품 갯수 상태 관리
    
    // point +, - 필터
    const [filterType, setFilterType] = useState(null);

    // 포인트 드롭다운
    const [pointOpen, setPointOpen] = useState(false);
 
    // 포인트 내역 데이터 가져오는 함수
    async function getPointData(memberId) {
        try {
            const data = await getPointList(memberId);
            const points = data.results.pointLogs;

            setPointLogs(points);

        } catch (error) {
            console.error('포인트 내역 가져오기 실패 : ', error);
            setPointLogs([]);
        }
    }

    // 현재포인트 데이터 가져오는 함수
    async function getCurrentPointData(memberId) {
        try {
            const data = await getCurrentPoint(memberId);
            const points = data.results.availablePoints;

            setPoint(points);

        } catch (error) {
            console.error('현재 포인트 가져오기 실패 : ', error);
            setPoint([]);
        }
    }

    // 예약진행상태별 카운트 데이터 가져오는 함수
    async function getRentalStateData() {
        try {
            const data = await getRentalStateList(memberId);
            const states = data.results.rentalStateCount;
    
            setRentalState(states);

        } catch (error) {
            console.error('예약 진행상태별 카운트 실패 : ', error);
            setRentalState([]);  // 오류 발생 시 빈 배열 설정
        }
    }
    
    // 랜더링 시 데이터 불러오기
    useEffect(() => {
        getCurrentPointData(memberId);
        getRentalStateData(memberId);

    }, [memberId]); 

    // 반납 예정 갯수 데이터 가져오는 함수
    async function fetchRentalData(memberId) {
        try {
            const data = await getActiveRentalList(memberId, 1); // 첫 페이지 데이터 가져오기
            const rentals = data.results.activeRentalList;

            // 현재 날짜와 만료 날짜 비교하여 필터링
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 맞춤


            
            const deadlineRentals = rentals.filter((rental) => {
                const rentalEndDate = new Date(`${rental.rentalEndDate}T00:00:00`);
                const daysRemaining = Math.floor((rentalEndDate - currentDate) / (1000 * 60 * 60 * 24));
                return daysRemaining <= 7 && daysRemaining >= 0; // 만료일 기준 7일 전부터 오늘까지
                
            });

            setReturnDeadlineCount(deadlineRentals.length); // 마감 임박 갯수 설정
        } catch (error) {
            console.error('Error fetching rental data:', error);
            setReturnDeadlineCount(0); // 에러 발생 시 초기화
        }
    }
    // 반납 예정 갯수 데이터 불러오기
    useEffect(() => {
        fetchRentalData(memberId);
    }, [memberId]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // 포인트 내역 드롭다운 열기 & 포인트 내역 데이터 불러오기
    const handlePoint = () => {
        setPointOpen(!pointOpen)
        getPointData(memberId)
    }

    // 필터링 된 로그 데이터
    const filteredLogs = pointLogs.filter((log) => {
        if (filterType === "plus") return log.addPoint !== 0;
        if (filterType === "minus") return log.usedPoint !== 0;
        return true;
    });

    // 숫자를 1,000 형식으로 변환
    const formatNumber = (num) => {
        if (typeof num !== "number" || isNaN(num)) {
            return "0";  // 값이 없거나 숫자가 아니면 기본값 0 반환
        }
        return num.toLocaleString();
    };

    return (
        <div className='mypage'>
            <div className="mypageMenu">
                <div className='userInfo'>
                    <img src={user?.imageLink == "a.jpg" || user?.imageLink == "userDefault.jpg" || user?.imageLink == null ? require("../../assets/images/userDefault.jpg") :user?.imageLink}
                            alt="프로필 이미지" />
                    <div>
                        <div className='name'>{user.userName}</div>
                        <div className='email'>{user.email}</div>
                    </div>
                </div>

                <div className='pointCupon'>
                    <div className='pointContainer'>
                        <div className='pointSubContainer' onClick={handlePoint}>
                            <div>포인트</div>
                            <div> {formatNumber(point)} Point</div>
                        </div>

                        {/* 드롭다운 컨텐츠 */}
                        {pointOpen && (
                            <div className="dropdownPointContent">
                                <div className='plusMinusButton'>
                                    <div onClick={() => setFilterType("plus")} className={filterType === "plus" ? "active" : ""}> + </div>
                                    <div onClick={() => setFilterType("minus")} className={filterType === "minus" ? "active" : ""}> - </div>
                                </div>
                                <div className='dropdownItemContent'>
                            {filteredLogs.map((log) => {
                                const pointValue =
                                    log.addPoint !== 0 ? `+${formatNumber(log.addPoint)}` : `-${formatNumber(log.usedPoint)}`;
                                return (
                                <div key={log.pointId} className="dropdownItem">
                                    <div className="pointDate">{log.pointDateTime}</div>
                                    <div className={`pointValue ${log.addPoint !== 0 ? "plus" : "minus"}`}>
                                        {pointValue} Point
                                    </div>
                                </div>
                                );
                            })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='cuponSubContainer'>
                        <div>반납요청 가능 건수</div>
                        <div>{returnDeadlineCount}</div>
                    </div>
                </div>

                <div className='rentalStatusIconBox'>
                    <div><img src={sackDollarIcon} alt="예약완료 아이콘" /></div>
                    <hr />
                    <div><img src={clockRotateIcon} alt="배송준비중 아이콘" /></div>
                    <hr />
                    <div><img src={truckIcon} alt="배송중 아이콘" /></div>
                    <hr />
                    <div><img src={checkIcon} alt="배송완료 아이콘" /></div>
                </div>
                <div className='rentalStatusBox'>
                    <div>예약대기</div>
                    <div>배송준비중</div>
                    <div>배송중</div>
                    <div>배송완료</div>
                </div>
                <div className='rentalStatusNumberBox'>
                <div>{rentalState?.[0]?.count || 0}</div>
                <div>{rentalState?.[1]?.count || 0}</div>
                <div>{rentalState?.[2]?.count || 0}</div>
                <div>{rentalState?.[3]?.count || 0}</div>
                </div>  


                <div className='userMypageTap'>
                    <div className='tapTitle'>나의 활동</div>
                    <div className='myPageSubTapTitle'>
                        <Link
                            to={`/mypage`}
                            onClick={() => handleTabClick('orders')}
                            className={`tab link ${activeTab === 'orders' ? 'active' : ''}`}>
                            <div>주문/배송</div>
                        </Link>
                        <Link
                            to={`/mypage/returns`}
                            onClick={() => handleTabClick('return')}
                            className={`tab link ${activeTab === 'return' ? 'active' : ''}`}>
                            <div>사용상품/반납</div>
                        </Link>
                        <Link
                            to={`/mypage/inquiry`}
                            onClick={() => handleTabClick('inquiries')}
                            className={`tab link ${activeTab === 'inquiries' ? 'active' : ''}`}>
                            <div>문의내역</div>
                        </Link>
                        <Link
                            to={`/mypage/review`}
                            onClick={() => handleTabClick('reviews')}
                            className={`tab link ${activeTab === 'reviews' ? 'active' : ''}`}>
                            <div>리뷰</div>
                        </Link>
                        <Link
                            to={`/mypage/favorites`}
                            onClick={() => handleTabClick('favorites')}
                            className={`tab link ${activeTab === 'favorites' ? 'active' : ''}`}>
                            <div>관심상품</div>
                        </Link>
                        <Link
                            to={`/mypage/recent`}
                            onClick={() => handleTabClick('recent')}
                            className={`tab link ${activeTab === 'recent' ? 'active' : ''}`}>
                            <div>최근본상품</div>
                        </Link>
                    </div>

                    <div className='tapTitle'>정보 관리</div>
                    <div className='myPageSubTapTitle'>
                        <Link
                            to={`/mypage/edit`}
                            onClick={() => handleTabClick('info')}
                            className={`tab link ${activeTab === 'info' ? 'active' : ''}`}>
                            <div>회원정보수정</div>
                        </Link>
                        <Link
                            to={`/mypage/deliveryaddress`}
                            onClick={() => handleTabClick('address')}
                            className={`tab link ${activeTab === 'address' ? 'active' : ''}`}>
                            <div>배송지관리</div>
                        </Link>
                        <Link
                            to={`/mypage/convert`}
                            onClick={() => handleTabClick('convert')}
                            className={`tab link ${activeTab === 'convert' ? 'active' : ''}`}>
                            <div>제공자 전환</div>
                        </Link>
                    </div>
                </div>
            </div>
            <div className='mypageContent'>
                <Outlet />
            </div>
        </div>
    )

}

export default MyPage