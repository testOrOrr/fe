import OwnerSalesCSS from './ownerSales.module.css';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSalesByOwner } from '../../apis/RentalAPI';

function OwnerSales() {

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    // 데이터관리
    const [ownerSalesList, setOwnerSalesList] = useState([]);// 매출 데이터
    const [yearMonth, setYearMonth] = useState(getFormattedDateForMonthInput());// 선택한 Date
    const [selectedProductNo, setSelectedProductNo] = useState('주문번호');    // 선택한 주문번호
    const [uniqueProductNos, setUniqueProductNos] = useState([]); // 중복 제거한 주문번호 관리
    const [selectedRentalNo, setSelectedRentalNo] = useState(null); // 선택된 예약번호

    // 상품번호 중복 제거 로직 추가
    useEffect(() => {
        const products = [...new Set(ownerSalesList.map(item => item.productNo))];
        setUniqueProductNos(['주문번호', ...products]);
    }, [ownerSalesList]);

    // 변경된 getData 함수 (productNo 파라미터 제거)
    async function getData(memberId, yearMonth) {
        try {
            const data = await getSalesByOwner(memberId, yearMonth, null);
            const sales = data.results.ownerSalesData;
    
            if (sales) {
                setOwnerSalesList(sales);
    
                // 초기 selectedRentalNo 설정
                if (sales.length > 0) {
                    setSelectedRentalNo(sales[0].rentalNo);
                }
    
                const products = [...new Set(sales.map(item => item.productNo))];
                setUniqueProductNos(['주문번호', ...products]);
            } else {
                setOwnerSalesList([]);
                setUniqueProductNos(['주문번호']);
                setSelectedRentalNo(null); // 데이터 없을 경우 초기화
            }
        } catch (error) {
            console.error('제공자별 Sales 내역 불러오기 실패 :', error);
            setOwnerSalesList([]);
            setUniqueProductNos(['주문번호']);
            setSelectedRentalNo(null); // 에러 발생 시 초기화
        }
    }

    useEffect(() => {
        getData(memberId, yearMonth, null);  
    }, [memberId]);

    // 오늘 날짜를 YYYY-MM 형식으로 변환하는 함수
    function getFormattedDateForMonthInput() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month starts from 0
        return `${year}-${month}`;
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    // 필터링된 데이터 계산
    const filteredSales = selectedProductNo === '주문번호' 
    ? ownerSalesList 
    : ownerSalesList.filter(item => item.productNo === selectedProductNo);

    // 선택된 예약번호에 해당하는 상세 데이터
    const selectedRentalDetails = ownerSalesList.find(item => item.rentalNo === selectedRentalNo);

    // 조회 중인 월의 26일 계산
    function calculateSettlementDate(yearMonth) {
        return `${yearMonth}.26`;
    }

    // 총 정산 금액 계산 (수수료 5% 제외)
    function calculateTotalSettlement(filteredSales) {
        return filteredSales.reduce((acc, item) => acc + ((item.rentalPrice * item.rentalNumber * 0.95)*0.9), 0);
    }
    

    return(
        <div className={OwnerSalesCSS.salesContainer}>
            <div className={OwnerSalesCSS.title}>정산관리</div>

            <div className={OwnerSalesCSS.monthSearchContainer}>
                <div>날짜</div>
                <input 
                    type="month"
                    value={yearMonth}
                    onChange={(e) => {
                        setYearMonth(e.target.value);
                        getData(memberId,e.target.value, null);
                    }}
                />
            </div>

            <div className={OwnerSalesCSS.salesContext}>
                <div>총 정산금액</div>
                <div>총 : {calculateTotalSettlement(filteredSales).toLocaleString()} 원</div>
            </div>

            <div className={OwnerSalesCSS.itemsContext}>
                <table className={OwnerSalesCSS.salesTable}>
                    <thead>
                        <tr>
                            <th style={{ width: "11%" }}>예약번호</th>
                            <th style={{ width: "11%" }}> 
                                <select 
                                    className={OwnerSalesCSS.productNoSelect}
                                    value={selectedProductNo}
                                    onChange={(e) => setSelectedProductNo(e.target.value)}  // [!code ++]
                                >
                                    {uniqueProductNos.map((productNo, index) => (
                                        <option key={index} value={productNo}>
                                            {productNo}
                                        </option>
                                    ))}
                                </select>
                            </th>
                            <th style={{ width: "20%" }}>상품명</th>
                            <th style={{ width: "8%" }}>대여자명</th>
                            <th style={{ width: "8%" }}>대여갯수</th>
                            <th style={{ width: "9%" }}>결제금액</th>
                            <th style={{ width: "11%" }}>주문일</th>
                            <th style={{ width: "11%" }}>대여시작일</th>
                            <th style={{ width: "11%" }}>대여만료일</th>
                        </tr>
                    </thead>
                    {/* tbody에 직접 스크롤 적용 */}
                    <tbody className={OwnerSalesCSS.scrollableBody}>
                        {filteredSales.length > 0 ? (  // [!code ++]
                            filteredSales.map((item, index) => (  // [!code ++]
                                <tr 
                                    key={index} 
                                    onClick={() => setSelectedRentalNo(item.rentalNo)} // 각 행에 onClick 이벤트 추가
                                >
                                    <td style={{ width: "11%" }}>{item.rentalNo}</td>
                                    <td style={{ width: "11%" }}>{item.productNo}</td>
                                    <td style={{ width: "20%" }}>{item.productName}</td>
                                    <td style={{ width: "8%" }}>{item.memberId}</td>
                                    <td style={{ width: "8%" }}>{item.rentalNumber}</td>
                                    <td style={{ width: "9%" }}>{(item.rentalPrice * item.rentalNumber *0.9).toLocaleString()} 원</td>
                                    <td style={{ width: "11%" }}>{formatDate(item.orderDate)}</td>
                                    <td style={{ width: "11%" }}>
                                        {item.rental_start_date ? formatDate(item.rental_start_date) : "-"}
                                    </td>
                                    <td style={{ width: "11%" }}>
                                        {item.rental_end_date ? formatDate(item.rental_end_date) : "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center" }}>
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 상세 정산 내역 */}
            {selectedRentalDetails && (
                <div className={OwnerSalesCSS.detailItemContext}>
                    <div>상세 정산 내역</div>

                    <table className={OwnerSalesCSS.salesTable}>
                        <thead>
                            <tr>
                                <th style={{ width: "15%" }}>예약번호</th>
                                <th style={{ width: "25%" }}>상품명</th>
                                <th style={{ width: "15%" }}>결제금액</th>
                                <th style={{ width: "15%" }}>수수료</th>
                                <th style={{ width: "15%" }}>최종 정산금</th>
                                <th style={{ width: "15%" }}>정산일</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{selectedRentalDetails.rentalNo}</td>
                                <td>{selectedRentalDetails.productName}</td>
                                <td>{((selectedRentalDetails.rentalPrice*selectedRentalDetails.rentalNumber)*0.9).toLocaleString()} 원</td>
                                <td>{((selectedRentalDetails.rentalPrice*selectedRentalDetails.rentalNumber * 0.05)*0.9).toLocaleString()} 원</td>
                                <td>{((selectedRentalDetails.rentalPrice*selectedRentalDetails.rentalNumber* 0.95)*0.9).toLocaleString()} 원</td>
                                <td>{calculateSettlementDate(yearMonth)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default OwnerSales;