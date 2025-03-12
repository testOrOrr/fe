import { useEffect, useState } from "react"
import AdminTop from "../../component/adminpage/AdminTop"
import AdNoticeCss from './AdminNotice.module.css'
import { deleteNotice, getAllNoticeList, registerNotice } from "../../apis/NoticeAPI"
import BtnModal from "../../component/BtnModal"

function AdminNotice() {
    const [noticeList, setNoticeList] = useState([])
    const [selectedNo, setSelectedNo] = useState()
    const [selectedNotice, setSelectedNotice] = useState();
    const [viewMode, setViewMode] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [ModalMsg, setModalMsg] = useState('')

    const viewRoll = {
        "all": "전체",
        "user": "일반 사용자",
        "owner": "사장님"
    }

    async function getData() {
        const response = await getAllNoticeList()

        setNoticeList(response)
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        console.log("noticeList : ", noticeList)
    }, [noticeList])


    useEffect(() => {
        console.log("selectedNotice : ", selectedNotice)
    }, [selectedNotice])

    useEffect(() => {
        setSelectedNotice(noticeList.find(item => item.noticeNo == selectedNo))
    }, [selectedNo])

    function detailNotice(noticeNo) {
        console.log("noticeNo : ", noticeNo)
        setSelectedNo(noticeNo)
    }

    function showView() {
        setSelectedNo(null)
        setViewMode(true)
    }

    function showRegister() {
        setSelectedNo(null)
        setViewMode(false)
    }

    async function saveNotice() {
        console.log("저장 예정")
        setLoading(true)
        setModalMsg("등록 중 ... ")

        const title = document.querySelector("#registerTitle")
        const viewAccess = document.querySelector("#viewAccess")
        const registerContent = document.querySelector("#registerContent")

        if (title.value.trim() == '') {
            setModalMsg("제목을 입력해주세요")
            setLoading(false)
            setShowModal(true)
            return
        }

        if (registerContent.value.trim() == '') {
            setModalMsg("공지사항 내용을 입력해주세요")
            setLoading(false)
            setShowModal(true)
            return
        }

        const newNotice = {
            "noticeTitle": title?.value,
            "viewRoll": viewAccess?.value,
            "noticeContent": registerContent.value
        }

        const response = await registerNotice({ newNotice })

        setLoading(false)
        setModalMsg(response)
        setShowModal(true)
        showView()
        getData()
    }

    async function removeNotice(noticeNo) {
        console.log("삭제 대상 : ", noticeNo)

        const response = await deleteNotice({ noticeNo })

        setLoading(false)
        setModalMsg(response)
        setShowModal(true)
        showView()
        getData()
    }

    return (
        <>
            <AdminTop title={'공지 사항'} />

            <div className={AdNoticeCss.wholeContainer}>
                <div className={AdNoticeCss.btnBox}>
                    <button onClick={showView}>목록</button>
                    <button onClick={viewMode ? showRegister : saveNotice}>{viewMode ? "등록" : "저장"}</button>
                    {selectedNo ?
                        <button onClick={() => removeNotice(selectedNo)}>삭제</button>
                        : null}
                </div>
                <div className={AdNoticeCss.listWholeBox}>
                    {
                        viewMode ?
                            selectedNo ?
                                <div className={AdNoticeCss.noticeDetail}>
                                    <div className={AdNoticeCss.noticeInfo}>
                                        <div className={AdNoticeCss.noticeTitle}>제목 :
                                            <span>{selectedNotice?.noticeTitle}</span>
                                        </div>
                                        <div>
                                            <div>작성 시간 :
                                                <span>{selectedNotice?.writeTime}</span>
                                            </div>
                                            <div>대상자 :
                                                <span>{viewRoll[selectedNotice?.viewRoll]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={AdNoticeCss.noticeContent}>
                                        {selectedNotice?.noticeContent}
                                    </div>
                                </div>
                                :
                                <>
                                    <div className={`${AdNoticeCss.noticeItem} ${AdNoticeCss.noticeTitle}`}>
                                        <div>번호</div>
                                        <div>대상자</div>
                                        <div className={AdNoticeCss.contentTitle}>제목</div>
                                        <div className={AdNoticeCss.contentAt}>작성일시</div>
                                    </div>

                                    <div className={AdNoticeCss.noticeList}>
                                        {noticeList.length > 0
                                            ? noticeList.map((notice, index) => (

                                                <div className={`${AdNoticeCss.noticeItem}`} key={notice.noticeNo} onClick={(e) => detailNotice(notice.noticeNo)}>
                                                    <div>{index + 1}</div>
                                                    <div>{viewRoll[notice.viewRoll]}</div>
                                                    <div className={AdNoticeCss.contentTitle}>{notice.noticeTitle}</div>
                                                    <div className={AdNoticeCss.contentAt}>{notice.writeTime}</div>
                                                </div>

                                            ))
                                            : <div>공지사항이 없습니다.</div>}
                                    </div>
                                </>
                            :
                            <div className={AdNoticeCss.registerBox}>
                                <div className={AdNoticeCss.noticeInfo}>
                                    <div>
                                        <span>제목 :</span>
                                        <input type="text" id="registerTitle" />
                                    </div>
                                    <div>
                                        <span>대상자 :</span>
                                        <select name="viewAccess" id="viewAccess">
                                            <option value="all">전체</option>
                                            <option value="user">일반 사용자</option>
                                            <option value="owner">사장님</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea id="registerContent" />
                            </div>
                    }
                </div>
                <BtnModal
                    showBtnModal={showModal}
                    setShowBtnModal={setShowModal}
                    btnText={loading ? undefined : "확인"}
                    modalContext={ModalMsg}
                />

            </div>
        </>
    )
}

export default AdminNotice