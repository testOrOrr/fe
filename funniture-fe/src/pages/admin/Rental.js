import AdminTop from '../../component/adminpage/AdminTop';
import RentalCss from './rental.module.css';
import { useState, useEffect } from 'react';
import { getAdminRentalList } from '../../apis/RentalAPI';
import { getStoreList } from '../../apis/RentalAPI';
import Pagination from '../../component/Pagination';
import { getMemberData } from '../../apis/MemberAPI';

function Rental() {

    // 렌탈 검색 관리
    const [searchRental, setSearchRental] = useState({
        rentalState: '',
        storeName: '',
        categoryName: '',
        searchDate: '',
        rentalNo: ''
    });

    // 렌탈 데이터
    const [rentalList, setRentalList] = useState([]);

    // selected-> option 에 추가할 회사
    const [storeList, setStoreList] = useState([]); 

    // 사용자 정보, 업체 정보
    const [userInfo, setUserInfo] = useState({});
    const [ownerInfo, setOwnerInfo] = useState({});

    // 페이징 상태 관리
    const [pageInfo, setPageInfo] = useState(null);  // pageInfo 상태 추가
    const [pageNum, setPageNum] = useState(1);  // pageNum 상태 관리 

    // 드롭다운을 하나만 열리도록 하기 위한 상태
    const [openRentalNo, setOpenRentalNo] = useState(null); 

    async function getData(searchRental,pageNum) {
        try {
            const data = await getAdminRentalList(searchRental,pageNum);
            const rentals = data.results.adminRentalList;
            const pageInfo = data.results.pageInfo;
     
            // API 호출 후 결과 처리
            if (data && data.results && data.results.adminRentalList) {
                setRentalList(rentals); // 검색 결과 상태에 저장
            } else {
                setRentalList([]); // 결과가 없을 경우 빈 리스트
            }

            setPageInfo(pageInfo);
        } catch (error) {
            console.error('Error fetching order list:', error);
            setRentalList([]); // 오류 발생 시 빈 리스트로 설정
        }
    }

    // 데이터 호출 함수
    async function getUserData(memberId) {
        
        try {
            const data = await getMemberData(memberId);
            setUserInfo(data.results.result);

        } catch (error) {
            console.error('배송지를 찾을 수 없음', error);
        }
    }

    async function getOwnerData(ownerNo) {
        
        try {
            const data = await getMemberData(ownerNo);
            setOwnerInfo(data.results.result);

        } catch (error) {
            console.error('배송지를 찾을 수 없음', error);
        }
    }



    // 배송지 등록 드롭다운 토글 변경
    const toggleDropdown = (item) => {
        // 이미 열려있는 드롭다운을 클릭했으면 닫기
        if (openRentalNo === item.rentalNo) {
            setOpenRentalNo(null); // 이미 열려있는 드롭다운을 닫음
        } else {
            setOpenRentalNo(item.rentalNo); // 새로운 드롭다운을 열기
        }

        // 사용자 정보와 업체 정보 가져오기
        getUserData(item.memberId);
        getOwnerData(item.ownerNo);
    };

    // 페이지 변경 시 데이터 가져오기
    const handlePageChange = (newPageNum) => {
        setPageNum(newPageNum);  // pageNum 변경
    };

    // 예약 리스트
    useEffect(() => {
        getData(searchRental, pageNum)
    }, [pageNum]);

    // 회사 리스트
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getStoreList();
                setStoreList(data.results?.result || []);
       
            } catch (error) {
                console.error("API 호출 실패:", error);
                setStoreList([]);
            }
        }
        fetchData();
    }, []);

    // 검색 조건 변경 핸들러 (Select, Input 공통)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchRental((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        setPageNum(1);  // 검색 시 첫 번째 페이지로 초기화
        getData(searchRental, 1);
    };

    // 초기화 실행 
    const handleReset = async () => {
        const initialSearch = {
            rentalState: '',
            storeName: '',
            categoryName: '',
            searchDate: '',
            rentalNo: ''
        };
    
        setSearchRental(initialSearch);  // 검색 조건 초기화
        setPageNum(1);  // 1페이지로 이동
    
        try {
            // 최신 초기화된 검색 조건으로 데이터 요청
            const data = await getAdminRentalList(initialSearch, 1);
    
            setRentalList(data.results.adminRentalList);
            setPageInfo(data.results.pageInfo); // 최신 페이지 정보 반영
        } catch (error) {
            console.error("초기화 후 전체 조회 실패:", error);
            setRentalList([]); // 오류 발생 시 리스트 초기화
        }
    };
    


    return (
        <>
            <AdminTop title={'예약 정보'} />

            <div className={RentalCss.adminRentalContent}>
                <div className={RentalCss.rentalSearchBox}>

                    <div className={RentalCss.rentalSearch}>
                        <select name="rentalState" value={searchRental.rentalState} onChange={handleChange}>
                            <option value='' selected>진행상태 선택</option>
                            <option value="예약대기">예약대기</option>
                            <option value="예약완료">예약완료</option>
                            <option value="예약취소">예약취소</option>
                            <option value="배송중">배송중</option>
                            <option value="배송완료">배송완료</option>
                            <option value="반납요청">반납요청</option>
                            <option value="수거중">수거중</option>
                            <option value="반납완료">반납완료</option>
                        </select>

                        <select name="storeName" value={searchRental.storeName} onChange={handleChange}>
                            <option value='' selected>회사선택</option>
                            {storeList.map((store) => (
                                <option key={store.owner_no} value={store.store_name}>
                                    {store.store_name}
                                </option>
                            ))}
                        </select>

                        <select name="categoryName" value={searchRental.categoryName} onChange={handleChange}>
                            <option value='' selected>분류 선택</option>
                            <option value="가전">가전</option>
                            <option value="가구">가구</option>
                        </select>

                        <input type="date" name="searchDate" value={searchRental.searchDate} onChange={handleChange} />

                        <input type="text" name="rentalNo" value={searchRental.rentalNo} placeholder="주문번호를 검색하세요"
                            onChange={handleChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // 엔터 입력 시 폼 제출 방지
                                    handleSearch();  // Enter 입력 시 검색 실행
                                }
                            }}
                        />
                    
                        <img
                            src={require(`../../assets/icon/rotate-right-solid.svg`).default}
                            alt="초기화 아이콘"
                            onClick={handleReset}
                        />
                
                        <img
                            src={require(`../../assets/icon/search-icon.svg`).default}
                            alt="검색 아이콘"
                            onClick={() => getData(searchRental, 1)}
                        />
                    </div>
                </div>

                <div className={RentalCss.rentalBox}>
                    <div className={RentalCss.rentalSubBox}>
                        <div className={RentalCss.title}>
                            <div style={{ width: "15%" }}><p>주문번호</p></div>
                            <div style={{ width: "10%" }}><p>회사명</p></div>
                            <div style={{ width: "10%" }}><p>진행상태</p></div>
                            <div style={{ width: "5%" }}><p>분류</p></div>
                            <div style={{ width: "35%" }}><p>제품명</p></div>
                            <div style={{ width: "20%" }}><p>사용시작/만료날짜</p></div>
                            <div style={{ width: "5%" }}><p>수량</p></div>
                        </div>
                    
                        <div className={RentalCss.rentalContainer}>
                            {/* 테이블 데이터 */}
                            {rentalList.length === 0 ? (
                                <div className={RentalCss.noResultsMessage}>
                                    <p>검색 조건에 맞는 예약 내역이 없습니다.</p>
                                </div>
                            ) : (
                                rentalList.map((item) => (
                                <>
                                    {/* 기본 행 */}
                                    <div
                                        key={item.rentalNo}
                                        className={RentalCss.rentalItems}
                                        onClick={() => toggleDropdown(item)}
                                    >
                                        <div style={{ width: '15%' }}><p>{item.rentalNo}</p></div>
                                        <div style={{ width: '10%' }}><p>{item.storeName}</p></div>
                                        <div style={{ width: '10%' }}><p>{item.rentalState}</p></div>
                                        <div style={{ width: '5%' }}><p>{item.categoryName}</p></div>
                                        <div style={{ width: '35%' }}><p>{item.productName}</p></div>
                                        <div style={{ width: '20%' }}>
                                            <p>
                                            {item.rentalStartDate && item.rentalEndDate
                                                ? `${item.rentalStartDate} ~ ${item.rentalEndDate}`
                                                : "배송전"}
                                            </p>
                                        </div>
                                        <div style={{ width: '5%' }}><p>{item.rentalNumber}</p></div>
                                    </div>

                                    {openRentalNo === item.rentalNo && (
                                        <div className={RentalCss.dropdownContent}>
                                            <div>
                                                <div>사용자 정보</div>                                                         
                                                <div>회원번호 : {userInfo.memberId}</div>                                                         
                                                <div>ID : {userInfo.email}</div>                                                         
                                                <div>이름 : {userInfo.username}</div>                                        
                                                <div>전화번호 : {userInfo.phoneNumber}</div>                                        
                                            </div>

                                            <div>
                                                <div>업체 정보</div>                                                         
                                                <div>회원번호 : {ownerInfo.memberId}</div>                                                         
                                                <div>ID : {ownerInfo.email}</div>                                                         
                                                <div>이름 : {ownerInfo.username}</div>                                        
                                                <div>전화번호 : {ownerInfo.phoneNumber}</div>                                    
                                            </div>
                                        </div>
                                    )}
                                </>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 페이징 컴포넌트 가져오기 */}
                    <div className={RentalCss.pagingContainer}>
                        <div>
                            <Pagination 
                            pageInfo={pageInfo} 
                            onPageChange={handlePageChange} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Rental;