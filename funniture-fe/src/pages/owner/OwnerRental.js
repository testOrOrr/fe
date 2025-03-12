import OwnerRentalCSS from './ownerRental.module.css'
import Pagination from '../../component/Pagination';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getOwnerRentalList, putRentalConfirm, putDeliverySubmit, putUpdateRentalState } from '../../apis/RentalAPI';
import BtnModal from '../../component/BtnModal';
import DetailOrder from '../user/DetailOrder';
import DeliverComModal from './DeliverComModal';
import DeliveryInProgressModal from './DeliveryInProgressModal';

function OwnerRental() {

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    // 데이터 & 검색 관리
    const [rentalList, setRentalList] = useState([]);   // 제공자별 예약 리스트
    const [period, setPeriod] = useState(''); // 1WEEK, 1MONTH, 3MONTH 만료기간별 필터링
    const [rentalTab, setRentalTab] = useState(''); // 예약, 배송, 반납 탭별 필터링
    const [rentalStateFilter, setRentalStateFilter] = useState(''); // 예약 상태 필터링

    // 체크박스 다중선택 주문번호 관리
    const [selectedRentalNos, setSelectedRentalNos] = useState([]);

    // 선택한 주문 정보 상태 - 주문상세모달에 가져갈 데이터
    const [selectedOrder, setSelectedOrder] = useState(null);

    // 페이징 상태 관리
    const [pageInfo, setPageInfo] = useState(null);  // pageInfo 상태 추가
    const [pageNum, setPageNum] = useState(1);  // pageNum 상태 관리 

    // 모달 상태 관리
    const [showBtnConfirmModal, setShowBtnConfirmModal] = useState(false)
    const [showBtnCancelModal, setShowBtnCancelModal] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeliverComModal, setShowDeliverComModal] = useState(false);
    const [showDeliverySubmitModal, setShowDeliverySubmitModal] = useState(false);
    const [showReservationCompleteModal, setShowReservationCompleteModal] = useState(false);    // 예약완료 -> 배송중
    const [showDeliveryInProgressModal, setShowDeliveryInProgressModal] = useState(false);  // 배송중 -> 배송완료
    const [showReturnRequestModal, setShowReturnRequestModal] = useState(false);    // 반납요청 -> 수거중
    const [showCollectionInProgressModal, setShowCollectionInProgressModal] = useState(false);  // 수거중 -> 반납완료 
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);
    const [showPickedUpModal, setShowPickedUpModal] = useState(false);
    const [showReturnedModal, setShowReturnedModal] = useState(false);

    // 데이터 가져오는 함수
    async function getData(ownerNo, period, rentalTab, pageNum) {
        try {
            const data = await getOwnerRentalList(ownerNo, period, rentalTab, pageNum);
            const rentals = data.results.ownerRentalList;
            const pageInfo = data.results.pageInfo;
            setRentalList(rentals);
            setPageInfo(pageInfo);

        } catch (error) {
            console.error('Error fetching rentals list:', error);
            setRentalList([]);
        }
    }

    // 페이지 변경 핸들러
    const handlePageChange = (newPageNum) => {

        setPageNum(newPageNum);  // pageNum 변경
    };

    // 검색 조건 변경 시 데이터 다시 불러오기
    useEffect(() => {
        getData(memberId, period, rentalTab, pageNum);
    }, [memberId, pageNum, period, rentalTab]);  // pageInfo 제거하고, period, rentalTab, pageNum만 의존성으로 설정

    // 기간 선택 핸들러
    const handlePeriodChange = (period) => {
        setPeriod(period);
    };

    // 탭 선택 핸들러
    const handleTabChange = (rentalTab) => {
        setRentalTab(rentalTab);
        setRentalStateFilter('');
    }

    // 상태 필터링 핸들러
    const handleStatusChange = (e) => {
        setRentalStateFilter(e.target.value);
    };

    // 예약진행상태로 필터링
    const filteredRentalList = rentalList.filter((rental) => {
        if (rentalStateFilter) {
            return rental.rentalState === rentalStateFilter;
        }
        return true; // 필터가 없으면 전체 렌탈 리스트 반환
    });

    // 예약진행상태마다 스타일 다르게 적용하기 위해서
    const getStatusClass = (status) => {

        switch (status) {
            case "예약대기":
                return "statusPending";
            case "예약완료":
                return "statusConfirmed";
            case "예약취소":
                return "statusCanceled";
            case "배송중":
                return "statusDelivering";
            case "배송완료":
                return "statusDelivered";
            case "반납요청":
                return "statusReturnRequested";
            case "수거중":
                return "statusCollecting";
            case "반납완료":
                return "statusReturned";
            default:
                return "statusDefault";
        }
    };
    // ----------------------------------------------------예약 확정----------------------------------------------------

    // 체크박스를 클릭했을 때 선택/해제하는 함수
    const handleCheckboxChange = (rentalNo) => {
        setSelectedRentalNos((prevSelectedRentalNos) => {
            if (prevSelectedRentalNos.includes(rentalNo)) {
                // 이미 선택된 항목이면 선택 해제
                return prevSelectedRentalNos.filter((no) => no !== rentalNo);
            } else {
                // 선택되지 않은 항목이면 추가
                return [...prevSelectedRentalNos, rentalNo];
            }
        });
    };

    const handleConfirmRental = async () => {
        if (selectedRentalNos.length === 0) {
            alert("예약을 선택해 주세요.");
            return;
        }

        // 선택된 예약의 상태를 확인
        const invalidSelections = rentalList.filter(rental =>
            selectedRentalNos.includes(rental.rentalNo) && rental.rentalState !== "예약대기"
        );

        // "예약대기" 상태가 아닌 항목이 있으면 예외처리
        if (invalidSelections.length > 0) {
            alert("선택한 예약 중 '예약대기' 상태가 아닌 항목이 포함되어 있습니다.");
            return;
        }

        try {
            // putRentalConfirm 호출해서 선택된 예약들을 "예약완료"로 변경
            await putRentalConfirm(selectedRentalNos);
            // 예약 리스트 갱신
            getData(memberId, period, rentalTab, pageNum);
            // 선택된 예약 리스트 초기화
            setSelectedRentalNos([]);
            // 확정 확인 모달 띄우기
            setShowBtnConfirmModal(true);
        } catch (error) {
            console.error('Error confirming rentals:', error);
            alert("오류가 발생했습니다.");
        }
    };



    // ----------------------------------------------------예약 취소----------------------------------------------------    

    // 주문번호 클릭하여 모달 열기 핸들러
    const handleOrderClick = (order) => {
        setSelectedOrder(order);   // 선택된 주문 정보 설정
        setIsModalOpen(true);      // 모달 열기
    };

    // 주문상세 모달 닫기 함수 -> 모달 내에서 예약취소 API 연결해서 상태 바꿈
    const handleCloseModal = (isCanceled = false) => {
        setIsModalOpen(false);  // 모달 닫기

        if (isCanceled) {
            getData(memberId, period, rentalTab, pageNum);  // 데이터 갱신
            setShowBtnCancelModal(true);  // 예약 취소 모달 표시
        }
    };

    // ---------------------------------------------------상태 변환 및 운송장, 운송업체 수정---------------------------------------------------    

    // 운송장 등록 모달 열기 핸들러
    const handleDoubleClick = (rental) => {
        switch (rental.rentalState) {
            case "예약완료":
                setShowReservationCompleteModal(true);
                setSelectedOrder(rental); // 선택된 주문 정보 저장
                break;
            case "배송중":
                setShowDeliveryInProgressModal(true);
                setSelectedOrder(rental);
                break;
            case "반납요청":
                setShowReturnRequestModal(true);
                setSelectedOrder(rental);
                break;
            case "수거중":
                setShowCollectionInProgressModal(true);
                setSelectedOrder(rental);
                break;
            default:
                console.warn("해당 상태에서 더블클릭 이벤트가 정의되지 않음:", rental.rentalState);
        }
    };

    // 더블클릭하여 모달 열수있는것만 cursor: pointer 효과주기위한 함수
    const canDoubleClick = (rentalState) => {
        const doubleClickableStates = ["예약완료", "배송중", "반납요청", "수거중"];
        return doubleClickableStates.includes(rentalState);
    };

    // 운송장 등록 & 예약완료 -> 배송중
    const handleDeliverySubmit = async (rentalNo, deliveryNo, deliverCom) => {

        try {
            await putDeliverySubmit(rentalNo, deliveryNo, deliverCom);
            // 예약 리스트 갱신
            getData(memberId, period, rentalTab, pageNum);
            setShowDeliverySubmitModal(true);
        } catch (error) {
            console.error('예약완료 배송중으로 상태 변환 중 에러 : ', error);
            alert("오류가 발생했습니다.");
        }

        setShowReservationCompleteModal(false);  // 모달 닫기
    };
    
    // 배송중 -> 배송완료
    const handleDeliveryComplete = async(rentalNo) => {
        try {
            await putUpdateRentalState(rentalNo);
            getData(memberId, period, rentalTab, pageNum);
            setShowDeliveredModal(true);
        } catch (error) {
            console.error('배송중 배송완료로 상태 변환 중 에러 : ', error);
            alert("오류가 발생했습니다.");
        }

        setShowDeliveryInProgressModal(false);  // 모달 닫기
    };

    // 운송장 등록 & 반납요청 -> 수거중
    const handleCollectionStart = async (rentalNo, deliveryNo, deliverCom) => {

        try {
            await putDeliverySubmit(rentalNo, deliveryNo, deliverCom);
            // 예약 리스트 갱신
            getData(memberId, period, rentalTab, pageNum);
            setShowPickedUpModal(true);
        } catch (error) {
            console.error('예약완료 배송중으로 상태 변환 중 에러 : ', error);
            alert("오류가 발생했습니다.");
        }

        setShowReturnRequestModal(false);  // 모달 닫기
    };

    // 수거중 -> 반납완료
    const handleCollectionComplete = async(rentalNo) => {
        try {
            await putUpdateRentalState(rentalNo);
            getData(memberId, period, rentalTab, pageNum);
            setShowReturnedModal(true);
        } catch (error) {
            console.error('배송중 배송완료로 상태 변환 중 에러 : ', error);
            alert("오류가 발생했습니다.");
        }

        setShowCollectionInProgressModal(false);  // 모달 닫기
        
    };



    




    return (
        <div className={OwnerRentalCSS.container}>
            <div className={OwnerRentalCSS.ownerRentalTab}>
                <div
                    onClick={() => handleTabChange('')}
                    className={rentalTab === '' ? OwnerRentalCSS.selected : ''}
                >
                    전체
                </div>
                <div
                    onClick={() => handleTabChange('예약')}
                    className={rentalTab === '예약' ? OwnerRentalCSS.selected : ''}
                >
                    예약
                </div>
                <div
                    onClick={() => handleTabChange('배송')}
                    className={rentalTab === '배송' ? OwnerRentalCSS.selected : ''}
                >
                    배송
                </div>
                <div
                    onClick={() => handleTabChange('반납')}
                    className={rentalTab === '반납' ? OwnerRentalCSS.selected : ''}
                >
                    반납
                </div>
            </div>
            <div className={OwnerRentalCSS.periodContainer}>
                <div>
                    <div>계약만료기간</div>
                    <div onClick={() => handlePeriodChange('')}
                        className={period === '' ? OwnerRentalCSS.selected : ''}>전체</div>
                    <div onClick={() => handlePeriodChange('1WEEK')}
                        className={period === '1WEEK' ? OwnerRentalCSS.selected : ''}>1주일</div>
                    <div onClick={() => handlePeriodChange('1MONTH')}
                        className={period === '1MONTH' ? OwnerRentalCSS.selected : ''}>1개월</div>
                    <div onClick={() => handlePeriodChange('3MONTH')}
                        className={period === '3MONTH' ? OwnerRentalCSS.selected : ''}>3개월</div>
                </div>

                {(rentalTab === '' || rentalTab === '예약') && (
                    <div>
                        <div onClick={handleConfirmRental}>
                            예약확정
                        </div>
                    </div>
                )}
            </div>
            <div className={OwnerRentalCSS.rentalContainer}>
                <table className={OwnerRentalCSS.rentalTable}>
                    <thead>
                        <tr>
                            <th style={{ width: "2%" }}></th>
                            <th style={{ width: "11%" }}>주문번호</th>
                            <th style={{ width: "10%" }}>택배사</th>
                            <th style={{ width: "10%" }}>운송장번호</th>
                            <th style={{ width: "20%" }}>상품명</th>
                            <th style={{ width: "4%" }}>수량</th>
                            <th style={{ width: "7%" }}>약정기간</th>
                            <th style={{ width: "7%" }}>A/S 횟수</th>
                            <th style={{ width: "19%" }}>사용 날짜 / 만료 날짜</th>
                            <th style={{ width: "10%" }}>
                                <select
                                    onChange={handleStatusChange}
                                    value={rentalStateFilter}
                                    className={OwnerRentalCSS.statusSelect}
                                >
                                    {rentalTab == "예약" ? (
                                        <>
                                            <option value="">예약진행상태</option>
                                            <option value="예약대기">예약대기</option>
                                            <option value="예약완료">예약완료</option>
                                            <option value="예약취소">예약취소</option>
                                        </>
                                    ) : rentalTab == "배송" ? (
                                        <>
                                            <option value="">배송진행상태</option>
                                            <option value="배송중">배송중</option>
                                            <option value="배송완료">배송완료</option>
                                        </>
                                    ) : rentalTab == "반납" ? (
                                        <>
                                            <option value="">반납진행상태</option>
                                            <option value="반납요청">반납요청</option>
                                            <option value="수거중">수거중</option>
                                            <option value="반납완료">반납완료</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="">예약진행상태</option>
                                            <option value="예약대기">예약대기</option>
                                            <option value="예약완료">예약완료</option>
                                            <option value="예약취소">예약취소</option>
                                            <option value="배송중">배송중</option>
                                            <option value="배송완료">배송완료</option>
                                            <option value="반납요청">반납요청</option>
                                            <option value="수거중">수거중</option>
                                            <option value="반납완료">반납완료</option>
                                        </>
                                    )}
                                </select>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRentalList.length > 0 ? (
                            filteredRentalList.map((rental, index) => (
                                <tr key={rental.rentalNo || index}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className={OwnerRentalCSS.rowCheckbox}
                                            checked={selectedRentalNos.includes(rental.rentalNo)}  // 체크 상태 동기화
                                            onChange={() => handleCheckboxChange(rental.rentalNo)}  // 체크박스 클릭 시 처리
                                        />
                                    </td>
                                    <td>
                                        <span
                                            className={OwnerRentalCSS.clickable}
                                            onClick={() => handleOrderClick(rental)}
                                        >
                                            {rental.rentalNo}
                                        </span>
                                    </td>
                                    <td className={canDoubleClick(rental.rentalState) ? OwnerRentalCSS.doubleClickable : ''} onDoubleClick={() => handleDoubleClick(rental)}>
                                        {rental.deliverCom || '-'}
                                    </td>
                                    <td className={canDoubleClick(rental.rentalState) ? OwnerRentalCSS.doubleClickable : ''} onDoubleClick={() => handleDoubleClick(rental)}>
                                        {rental.deliveryNo || '-'}
                                    </td>
                                    <td>{rental.productName}</td>
                                    <td>{rental.rentalNumber}</td>
                                    <td>{rental.rentalTerm}개월</td>
                                    <td>{rental.asNumber}회</td>
                                    <td>
                                        {rental.rentalStartDate && rental.rentalEndDate
                                            ? `${rental.rentalStartDate} ~ ${rental.rentalEndDate}`
                                            : '-'}
                                    </td>
                                    <td>
                                        <div className={`${OwnerRentalCSS[getStatusClass(rental.rentalState)]}`}>
                                            {rental.rentalState}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center" }}>예약된 데이터가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 예약확정 확인 모달 */}
            <BtnModal
                showBtnModal={showBtnConfirmModal}
                setShowBtnModal={setShowBtnConfirmModal}
                btnText="확인"
                modalContext="예약확정이 되었습니다."
                modalSize="sm"
            />

            {/* 예약취소 확인 모달 */}
            <BtnModal
                showBtnModal={showBtnCancelModal}
                setShowBtnModal={setShowBtnCancelModal}
                btnText="확인"
                modalContext="예약취소가 되었습니다."
                modalSize="sm"
            />

            {/* 예약완료 -> 배송중 (운송장, 운송업체 수정) */}
            <BtnModal
                showBtnModal={showReservationCompleteModal}
                setShowBtnModal={setShowReservationCompleteModal}
                modalSize="md"
                childContent={
                    <DeliverComModal 
                        selectedOrder={selectedOrder} 
                        onBtnClick={handleDeliverySubmit} 
                    />
                }
            />

            
            {/* 배송중 -> 배송완료 (수정버튼 운송장, 운송업체 수정)*/}
            <BtnModal
                showBtnModal={showDeliveryInProgressModal}
                setShowBtnModal={setShowDeliveryInProgressModal}
                modalSize="md"
                childContent={
                    <DeliveryInProgressModal 
                        selectedOrder={selectedOrder} 
                        onBtnClick={handleDeliveryComplete} 
                    />
                }
            />

            {/* 반납요청 -> 수거중 (운송장, 운송업체 수정) */}
            <BtnModal
                showBtnModal={showReturnRequestModal}
                setShowBtnModal={setShowReturnRequestModal}
                modalSize="md"
                childContent={
                    <DeliverComModal 
                        selectedOrder={selectedOrder} 
                        onBtnClick={handleCollectionStart} 
                    />
                }
            />

            {/* 수거중 -> 반납완료 (수정버튼 운송장, 운송업체 수정) */}
            <BtnModal
                showBtnModal={showCollectionInProgressModal}
                setShowBtnModal={setShowCollectionInProgressModal}
                modalSize="md"
                childContent={
                    <DeliveryInProgressModal 
                        selectedOrder={selectedOrder} 
                        onBtnClick={handleCollectionComplete} 
                    />
                }
            />
                        

            {/* 운송장 등록 확인 모달 */}
            <BtnModal
                showBtnModal={showDeliverySubmitModal}
                setShowBtnModal={setShowDeliverySubmitModal}
                btnText="확인"
                modalContext="운송장 등록이 되었습니다."
                modalSize="sm"
            />

            {/* 배송완료 상태수정 확인 모달 */}
            <BtnModal
                showBtnModal={showDeliveredModal}
                setShowBtnModal={setShowDeliveredModal}
                btnText="확인"
                modalContext="배송완료로 상태 수정되었습니다."
                modalSize="sm"
            />

            {/* 수거중 상태수정 확인 모달 */}
            <BtnModal
                showBtnModal={showPickedUpModal}
                setShowBtnModal={setShowPickedUpModal}
                btnText="확인"
                modalContext="수거중으로 상태 수정되었습니다."
                modalSize="sm"
            />

            {/* 반납완료 상태수정 확인 모달 */}
            <BtnModal
                showBtnModal={showReturnedModal}
                setShowBtnModal={setShowReturnedModal}
                btnText="확인"
                modalContext="반납완료로 상태 수정되었습니다."
                modalSize="sm"
            />

            {/* 주문 상세페이지 모달 */}
            {selectedOrder && isModalOpen && (
                <BtnModal
                    showBtnModal={isModalOpen}  // isModalOpen 상태로 모달을 열고 닫기
                    setShowBtnModal={handleCloseModal}  // 모달 닫는 함수 전달
                    modalContext="로그인 후 이용 가능합니다."
                    modalSize="lg"
                    childContent={<DetailOrder selectedOrder={selectedOrder} closeModal={handleCloseModal} />}
                />
            )}

            {/* 페이징 컴포넌트 가져오기 */}
            <div className={OwnerRentalCSS.pagingContainer}>
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

export default OwnerRental;