import AdminTop from '../../component/adminpage/AdminTop';
import RentalCss from './rental.module.css';
import { useState, useEffect } from 'react';
import Pagination from '../../component/Pagination';
import { callLeaverUserByAdminAPI, callChangeUserRoleAPI } from '../../apis/AdminAPI';
import { useNavigate, useLocation } from 'react-router-dom';
import BtnModal from '../../component/BtnModal';
import AdminModal from './adminModal.module.css';

function AdminLeaver() {

    const navigate = useNavigate();
    const location = useLocation(); // 현재 URL 경로 가져오기
    const [activeTab, setActiveTab] = useState(location.pathname); // 기본 활성화 탭 설정

    // 회원 정보 리스트를 저장할 상태
    const [leaverList, setLeaverList] = useState([]); // 여러 제공자 정보를 저장하는 배열
    const [selectedLeavers, setSelectedLeavers] = useState([]); // 체크박스 관리
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedLeaver, setSelectedLeaver] = useState(null);

    // const [showModal, setShowModal] = useState(false); // 접근 권한 변경 누를 때 뜨는 모달 
    const [selectAll, setSelectAll] = useState(false); // 체크박스 전체 선택

    // 얼러트 모달 상태 관리
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const [pageInfo, setPageInfo] = useState(null);

    useEffect(() => {
        setActiveTab(location.pathname); // URL 변경 시 activeTab 동기화
    }, [location.pathname]);

    const handleTabClick = (path) => {
        navigate(path); // 경로 이동
    };

    // 탈퇴자 목록을 가져오는 함수
    useEffect(() => {
        fetchLeaverList();
    }, []);

    const fetchLeaverList = async (pageNum = 1) => {
        try {
            const data = await callLeaverUserByAdminAPI(pageNum);
            console.log('data', data);
            setLeaverList(data.results.result.data);
            setPageInfo(data.results.result.pageInfo);
        } catch (error) {
            console.error('탈퇴자 회원 목록 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        console.log('관리자 페이지, 탈퇴자 useEffect 실행');
        callLeaverUserByAdminAPI(1);
    }, []);

    // 체크박스 변경 핸들러
    const handleCheckboxChange = (memberId) => {
        setSelectedLeavers((prev) => {
            const newSelected = prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId];
            setSelectAll(newSelected.length === leaverList.length);
            return newSelected;
        });
    };


    const handleSelectAllChange = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedLeavers(leaverList.map(leaver => leaver.memberId));
        } else {
            setSelectedLeavers([]);
        }
    };


    const handleAccessChangeClick = () => {
        if (selectedLeavers.length === 0) {
            setAlertMessage('변경할 사용자를 선택해주세요.');
            setShowAlertModal(true);
            return;
        }
        setShowAccessModal(true);
    };

    // const handleConfirmAccessChange = async () => {
    //     try {
    //         await callChangeUserRoleAPI(selectedLeavers);
    //         setAlertMessage('권한이 변경되었습니다.');
    //         await callLeaverUserByAdminAPI(setLeaverList); // 데이터 갱신
    //         setSelectedLeavers([]); // 선택 초기화
    //         setShowAccessModal(false);
    //     } catch (error) {
    //         console.error(error);
    //         setAlertMessage('권한 변경에 실패했습니다.');
    //     } finally {
    //         setShowAlertModal(true); // 얼러트 모달 표시
    //     }
    // };

    const handleConfirmAccessChange = async () => {
        try {
            await callChangeUserRoleAPI(selectedLeavers);
            setAlertMessage('권한이 변경되었습니다.');
            await fetchLeaverList(); // 데이터 갱신
            setSelectedLeavers([]); // 선택 초기화
            setShowAccessModal(false);
        } catch (error) {
            console.error('권한 변경 중 오류 발생:', error);
            setAlertMessage('권한 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setShowAlertModal(true); // 얼러트 모달 표시
        }
    };


    const handleLeaverClick = (leaver) => {
        setSelectedLeaver(leaver);
        setShowUserModal(true);
    };

    const renderLeaverModal = () => (
        <div className={AdminModal.leaverDiv}>
            <p><strong> ▷ 회원 ID  :</strong> {selectedLeaver?.memberId}</p>
            <p><strong>▷ 이름  :</strong> {selectedLeaver?.userName}</p>
            <p><strong>▷ 이메일  :</strong> {selectedLeaver?.email}</p>
            <p><strong>▷ 전화번호  :</strong> {selectedLeaver?.phoneNumber}</p>
            <p><strong>▷ 회원가입일  :</strong> {formatDate(selectedLeaver?.signupDate)}</p>
            <p><strong>▷ 포인트  :</strong> {selectedLeaver?.pointDTO.currentPoint}</p>
        </div>
    );

    // 얼러트 모달 닫기 핸들러
    const closeAlertModal = () => {
        setShowAlertModal(false);
        setAlertMessage('');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} / ${hours}시 ${minutes}분`;
    };


    return (
        <>
            <div className={RentalCss.adminRentalContent}>
                <div className={RentalCss.adminSelectButton}>
                    <button onClick={() => handleTabClick('/admin/authority/user')} className={`${RentalCss.button} ${activeTab === '/admin/authority/user' ? RentalCss.active : ''}`}>사용자</button>
                    <button onClick={() => handleTabClick('/admin/authority/owner')} className={`${RentalCss.button} ${activeTab === '/admin/authority/owner' ? RentalCss.active : ''}`}>제공자</button>
                    <button onClick={() => handleTabClick('/admin/authority/convert')} className={`${RentalCss.button} ${activeTab === '/admin/authority/convert' ? RentalCss.active : ''}`}>전환요청</button>
                    <button onClick={() => handleTabClick('/admin/authority/leaver')} className={`${RentalCss.button} ${activeTab === '/admin/authority/leaver' ? RentalCss.active : ''}`}>탈퇴자</button>
                    <button onClick={handleAccessChangeClick}>접근권한변경</button>
                </div>
                <div className={RentalCss.rentalBox}>
                    <div className={RentalCss.rentalSubBox}>
                        <div className={RentalCss.title}>
                            <div style={{ width: "3%" }}>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAllChange} />
                            </div>
                            <div style={{ width: "15%" }}><p>회원번호</p></div>
                            <div style={{ width: "10%" }}><p>이름</p></div>
                            <div style={{ width: "20%" }}><p>전화번호</p></div>
                            <div style={{ width: "15%" }}><p>이메일</p></div>
                            <div style={{ width: "27%" }}><p>회원가입일</p></div>
                            <div style={{ width: "13%" }}><p>포인트</p></div>
                        </div>
                        {leaverList.length === 0 ? (
                            <div className={RentalCss.noResultsMessage}>
                                <p>탈퇴한 회원이 없습니다.</p>
                            </div>
                        ) : (
                            leaverList.map((leaver) => (
                                <div key={leaver.memberId} className={RentalCss.rentalItems}>
                                    <div style={{ width: "3%" }} onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedLeavers.includes(leaver.memberId)}
                                            onChange={() => handleCheckboxChange(leaver.memberId)}
                                        />
                                    </div>
                                    <div style={{ width: '15%' }} onClick={() => handleLeaverClick(leaver)}><p>{leaver.memberId}</p></div>
                                    <div style={{ width: '10%' }} onClick={() => handleLeaverClick(leaver)}><p>{leaver.userName}</p></div>
                                    <div style={{ width: '20%' }} onClick={() => handleLeaverClick(leaver)}><p>{leaver.phoneNumber}</p></div>
                                    <div style={{ width: '15%' }} onClick={() => handleLeaverClick(leaver)}><p>{leaver.email}</p></div>
                                    <div style={{ width: '27%' }} onClick={() => handleLeaverClick(leaver)}><p>{formatDate(leaver.signupDate)}</p></div>
                                    <div style={{ width: '13%' }} onClick={() => handleLeaverClick(leaver)}><p>{leaver.pointDTO.currentPoint}</p></div>
                                </div>
                            ))
                        )}
                    </div>
                    {pageInfo && (
                        <Pagination pageInfo={pageInfo} onPageChange={(pageNum) => fetchLeaverList(pageNum)} />
                    )}
                </div>
                <BtnModal
                    showBtnModal={showAccessModal}
                    setShowBtnModal={setShowAccessModal}
                    modalTitle="▶ 접근 권한 변경"
                    modalContext="선택된 사용자의 권한을 변경하시겠습니까?"
                    btnText="예"
                    secondBtnText="취소"
                    onSuccess={handleConfirmAccessChange}
                    onFail={() => setShowAccessModal(false)}
                />
                <BtnModal
                    showBtnModal={showUserModal}
                    setShowBtnModal={setShowUserModal}
                    modalTitle="▶ 탈퇴 회원 정보"
                    modalContext={renderLeaverModal()}
                    btnText="확인"
                    onSuccess={() => setShowUserModal(false)}
                />
                {/* 얼러트 모달 */}
                <BtnModal
                    showBtnModal={showAlertModal}
                    setShowBtnModal={setShowAlertModal}
                    modalTitle="알림"
                    modalContext={alertMessage}
                    btnText="확인"
                    onSuccess={closeAlertModal}
                />
            </div>
        </>
    );
}

export default AdminLeaver;