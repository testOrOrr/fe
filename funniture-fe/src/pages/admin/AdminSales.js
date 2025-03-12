import AdminSalesCSS from './adminSales.module.css'
import AdminTop from '../../component/adminpage/AdminTop';
import { getSalesByDate, getAllStoreList } from '../../apis/RentalAPI';
import { useState, useEffect } from 'react';
import Pagination from '../../component/Pagination';

function AdminSales() {

    // 매출 데이터
    const [salesList, setSalesList] = useState([]);
    
    // 총매출
    const [totalSettlement, setTotalSettlement] = useState(0);
    const [totalFee, setTotalFee] = useState(0);

    // 페이징 상태 관리
    const [pageInfo, setPageInfo] = useState(null);  // pageInfo 상태 추가
    const [pageNum, setPageNum] = useState(1);  // pageNum 상태 관리 

    // 회사 리스트
    const [storeList, setStoreList] = useState([]); 

    // 선택한 회사
    const [selectedStore, setSelectedStore] = useState(null);
    // 선택한 Date
    const [yearMonth, setYearMonth] = useState(getFormattedDateForMonthInput());

    async function getData(yearMonth,selectedStore,pageNum) {
        try {
            const data = await getSalesByDate(yearMonth,selectedStore,pageNum);
            const sales = data.results.salesData;
            const pageInfo = data.results.pageInfo;
        
            // API 호출 후 결과 처리
            if (data.results.salesData) {
                setSalesList(sales); // 검색 결과 상태에 저장
            } else {
                setSalesList([]); // 결과가 없을 경우 빈 리스트
            }

            setPageInfo(pageInfo);
        } catch (error) {
            console.error('Sales 내역 불러오기 실패 :', error);
            setSalesList([]); // 오류 발생 시 빈 리스트로 설정
        }
    }

    useEffect(() => {
        getData(yearMonth, selectedStore, pageNum);  
    }, [selectedStore, pageNum]);
    
    // 회사 리스트
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAllStoreList();
                setStoreList(data.results?.result || []);
        
            } catch (error) {
                console.error("API 호출 실패:", error);
                setStoreList([]);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        let settlementSum = 0;
        let feeSum = 0;
    
        salesList.forEach((sale) => {
            const fee = Math.floor(sale.totalAmount * 0.05 *0.9);
            const settlement = sale.totalAmount*0.9 - fee;
    
            settlementSum += settlement;
            feeSum += fee;
        });
    
        setTotalSettlement(settlementSum);
        setTotalFee(feeSum);
    }, [salesList]);

    

    // 오늘 날짜를 YYYY-MM 형식으로 변환하는 함수
    function getFormattedDateForMonthInput() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month starts from 0
        return `${year}-${month}`;
    }

    // 회사 선택 시 상태 업데이트만 진행
    const handleStoreSearch = (storeName) => {
        setSelectedStore(storeName); // 선택된 회사 업데이트
        setPageNum(1); // 페이지 번호 초기화
    };

    // 페이지 변경 시 데이터 가져오기
    const handlePageChange = (newPageNum) => {
        setPageNum(newPageNum);  // pageNum 변경
    };

    // 검색 초기화 핸들러
    const handleResetSearch = () => {
        setSelectedStore(null); // 선택된 회사 초기화
        setPageNum(1); // 페이지 번호 초기화
    };

    return(
        <>
            <AdminTop title={'매출 현황'} />
            <div className={AdminSalesCSS.adminSaleContainer}>
                <div className={AdminSalesCSS.adminSearchContainer}>
                    <div className={AdminSalesCSS.monthSearchContainer}>
                        <div>날짜</div>
                        <input 
                            type="month"
                            value={yearMonth}
                            onChange={(e) => {
                                setYearMonth(e.target.value);
                                getData(e.target.value, selectedStore, pageNum);
                            }}
                        />
                    </div>
                    <hr/>
                    <div className={AdminSalesCSS.storeSearchContainer}>
                        <div onClick={() => handleResetSearch()}>검색 초기화</div>
                        <div>
                            {storeList.map((store) => (
                                <div
                                    onClick={() => handleStoreSearch(store.store_name)}
                                    key={store.owner_no}
                                    className={selectedStore === store.store_name ? AdminSalesCSS.selectedStore : ''}
                                >
                                {store.store_name}
                             </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={AdminSalesCSS.totalAmountContainer}>
                    <div>총 매출</div>
                    <div>
                        <div>정산금 : {totalSettlement.toLocaleString()} 원</div>
                        <div>수수료 : {totalFee.toLocaleString()} 원</div>
                    </div>
                </div>

                <div className={AdminSalesCSS.salesItemContainer}>
                    <div className={AdminSalesCSS.salesSubContainer}>
                        <div className={AdminSalesCSS.title}>
                            <div style={{ width: "15%" }}><p>상품번호</p></div>
                            <div style={{ width: "10%" }}><p>회사명</p></div>
                            <div style={{ width: "10%" }}><p>카테고리</p></div>
                            <div style={{ width: "35%" }}><p>제품명</p></div>
                            <div style={{ width: "15%" }}><p>결제금액</p></div>
                            <div style={{ width: "10%" }}><p>수수료</p></div>
                            <div style={{ width: "15%" }}><p>정산금</p></div>
                        </div>

                        <div className={AdminSalesCSS.salesItems}>
                            {/* 테이블 데이터 */}
                            {salesList.length === 0 ? (
                                <div className={AdminSalesCSS.noResultsMessage}>
                                    <p>매출 내역이 없습니다.</p>
                                </div>
                            ) : (
                                salesList.map((sale) => {
                                    const fee = Math.floor(sale.totalAmount * 0.05);  // 수수료 5% 가정
                                    const settlement = sale.totalAmount - fee;

                                    return (
                                        <div key={sale.productNo} className={AdminSalesCSS.salesItem}>
                                            <div style={{ width: "15%" }}><p>{sale.productNo}</p></div>
                                            <div style={{ width: "10%" }}><p>{sale.storeName}</p></div>
                                            <div style={{ width: "10%" }}><p>{sale.categoryName}</p></div>
                                            <div style={{ width: "35%" }}><p>{sale.productName}</p></div>
                                            <div style={{ width: "15%" }}><p>{(sale.totalAmount*0.9).toLocaleString()} 원</p></div>
                                            <div style={{ width: "10%" }}><p>{(fee*0.9).toLocaleString()} 원</p></div>
                                            <div style={{ width: "15%" }}><p>{(settlement*0.9).toLocaleString()} 원</p></div>
                                        </div>
                                    );
                                })
                            )}
                            
                            {/* 페이징 컴포넌트 가져오기 */}
                            <div className={AdminSalesCSS.pagingContainer}>
                                <div>
                                    <Pagination 
                                    pageInfo={pageInfo} 
                                    onPageChange={handlePageChange} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminSales;