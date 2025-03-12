import AdDirectCss from './AdminDirectPage.module.css'
import { getConsultingList, getUSerInquiryList, sendChat } from "../../apis/AdminInquiryAPI";
import BtnModal from "../../component/BtnModal";
import { ReactComponent as Message } from '../../assets/icon/message.svg'
import { ReactComponent as Important } from '../../assets/icon/important-icon.svg'
import { ReactComponent as SendIcon } from '../../assets/icon/send-icon.svg'

import { useEffect, useState } from "react";

function AdminDirectPage() {
    // 1:1 문의 꺼
    const [showTab, setShowTab] = useState("all")
    const [orderBy, setOrderBy] = useState("desc")
    const [userList, setUserList] = useState([])
    const [filteredUserList, setFilteredUserList] = useState([]);
    const [inquiryList, setInquiryList] = useState([])
    const [selectUserNo, setSelectUserNo] = useState()
    const [deValue, setDeValue] = useState(); // 입력 값 임시 저장
    const [showModal, setShowModal] = useState(false)
    const [modalMsg, setModalMsg] = useState('')

    async function getUserList() {
        const response = await getConsultingList()

        if (response.httpStatusCode == 200) {
            setUserList(response?.results.result)
        }
    }

    useEffect(() => {
        getUserList()
    }, [])

    useEffect(() => {
        let filteredList = [];

        if (showTab === "all") {
            filteredList = userList;
        } else if (showTab === "ing") {
            filteredList = userList.filter(item => item.isConsulting === true);
        } else if (showTab === "done") {
            filteredList = userList.filter(item => item.isConsulting === false);
        }

        setFilteredUserList(filteredList);
        setOrderBy("desc")
    }, [showTab, userList]); // showTab 또는 userList가 변경될 때 실행

    // function handleOrderByChange(e) {
    //     const newOrderBy = e.target.value;
    //     setOrderBy(newOrderBy)

    //     if (newOrderBy === "desc") {
    //         const acsList = [...filteredUserList]
    //         setFilteredUserList(acsList)
    //     } else if (newOrderBy === "asc") {
    //         const descList = [...filteredUserList].reverse()
    //         setFilteredUserList(descList)
    //     }
    // }

    useEffect(() => {
        console.log("순서 변경 : ", filteredUserList)
    }, [filteredUserList])

    useEffect(() => {
        console.log("orderBy: ", orderBy)
    }, [orderBy])

    async function getUserChatData(memberId) {
        console.log("클릭한 memberId : ", memberId)
        const response = await getUSerInquiryList({ memberId })

        if (response.httpStatusCode == 200) {
            setInquiryList(response.results.result)
        }
    }

    useEffect(() => {
        if (selectUserNo && selectUserNo != '') {
            getUserChatData(selectUserNo)
        }
    }, [selectUserNo])

    useEffect(() => {
        console.log("=================================")
        console.log("회원 문의 정보 userSend : ", inquiryList)
        console.log("=================================")

        const textareaBox = document.querySelector(`#inputContent`);
        const chatBox = document.querySelector("#directChatListBox")

        if (chatBox) {
            chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
            textareaBox.style.height = 'auto'
        }

    }, [inquiryList])

    // 내용 입력 업데이트 디바운스 적용
    function updateAnswer(value) {
        setDeValue(value)

        const textareaBox = document.querySelector(`#inputContent`);
        const textarea = document.querySelector(`#inputContent textarea`);

        // 변경전 초기화 먼저
        textareaBox.style.height = 'auto'
        textareaBox.style.height = `${textarea.scrollHeight + 20}px`
    }

    async function sendContent() {
        console.log("입력 내용 insert 대기 : ", deValue)
        console.log("selectUserNo : ", selectUserNo)

        if (selectUserNo != '' && selectUserNo != null && selectUserNo != undefined) {

            const newChat = {
                senderNo: 'ADMIN',
                receiveNo: selectUserNo,
                contents: deValue
            }

            await sendChat({ newChat });
            getUserChatData(selectUserNo)

            setDeValue('')
        } else {
            setModalMsg("받는사람이 없습니다.")
            setShowModal(true)
        }
    }

    useEffect(() => {
        console.log("현재의 기준 : ", orderBy)
        console.log("실행")

        if (orderBy) {
            setFilteredUserList((prev) => prev.reverse())
        }
    }, [orderBy])

    function reLoad() {
        setSelectUserNo(null)
        getUserList()
        setInquiryList([])
    }

    return (
        <div className={AdDirectCss.directWholeContainer}>
            <div className={AdDirectCss.directListContainer}>
                <div className={AdDirectCss.statusBox}>
                    <div className={AdDirectCss.statusItem} onClick={(e) => setShowTab("all")}>
                        <input type="radio" name="showTab" id="all"
                            checked={showTab == "all"}
                            onChange={(e) => setShowTab(e.target.id)}
                        />
                        <div>
                            <Message className={AdDirectCss.MsgIcon} />
                        </div>
                        <label htmlFor="all">전체</label>
                    </div>
                    <div className={AdDirectCss.statusItem} onClick={(e) => setShowTab("ing")}>
                        <input type="radio" name="showTab" id="ing"
                            checked={showTab == "ing"}
                            onChange={(e) => setShowTab(e.target.id)}
                        />
                        <div>
                            <Message className={AdDirectCss.MsgIcon} />
                        </div>
                        <label htmlFor="ing">진행 중</label>
                    </div>
                    <div className={AdDirectCss.statusItem} onClick={(e) => setShowTab("done")}>
                        <input type="radio" name="showTab" id="done"
                            checked={showTab == "done"}
                            onChange={(e) => setShowTab(e.target.id)}
                        />
                        <div>
                            <Message className={AdDirectCss.MsgIcon} />
                        </div>
                        <label htmlFor="done">종료</label>
                    </div>
                </div>
                <div className={AdDirectCss.orderByBox}>
                    <div onClick={reLoad}>
                        <button>새로고침</button>
                        <img src={require("../../assets/icon/arrows-rotate-solid.svg").default} alt="" />
                    </div>
                    <select name="orderBy" id="orderBy" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                        <option value="desc">최근 대화순</option>
                        <option value="asc">과거 대화순</option>
                    </select>
                </div>
                <div className={AdDirectCss.userListBox}>
                    {filteredUserList && filteredUserList.length > 0 ?
                        filteredUserList.map(user => (
                            <div className={AdDirectCss.userItem} value={user.memberId} onClick={(e) => setSelectUserNo(user.memberId)}>
                                <div className={AdDirectCss.isConsulting}>
                                    <div style={{ backgroundColor: user.isConsulting ? "#7F5539" : "#a8a8a8" }}>
                                        {user.isConsulting ? "상담중" : "상담종료"}
                                    </div>
                                </div>
                                <div className={AdDirectCss.userInfoBox}>
                                    <div className={AdDirectCss.userImgBox}>
                                        <img
                                            src={user.imageLink == "a.jpg" || user.imageLink == null || user.imageLink == "default.jpg"
                                                ? require("../../assets/images/default.jpg") :
                                                user.imageLink
                                            }
                                            alt="사용자 이미지" />
                                    </div>
                                    <div className={AdDirectCss.userInfo}>
                                        <div><span>{user.userName}</span>님</div>
                                        <div className={AdDirectCss.userEmail}>{user.email}</div>
                                    </div>
                                    <div className={AdDirectCss.checkAbleBox}>
                                        <Important
                                            className={AdDirectCss.checkAble}
                                            style={{ fill: "#c1121f", display: user.isConsulting ? user.meLast ? "block" : "none" : "none" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                        : <div>문의 중인 사용자가 없습니다.</div>}
                </div>
            </div>
            <div className={AdDirectCss.directChatContainer}>
                <div>고객 이름 : {userList.find(item => item.memberId == selectUserNo)?.userName}</div>
                <div className={AdDirectCss.directChatListBox} id="directChatListBox">
                    {inquiryList.length == 0
                        ? <div>상담 내역이 없습니다.</div>
                        : (
                            <>
                                {inquiryList.map(item =>
                                (item.receiveNo == "ADMIN" ?
                                    <div className={AdDirectCss.inquiryItem}>
                                        <div className={AdDirectCss.receiveMsgT}></div>
                                        <div className={AdDirectCss.inquiryContent}
                                            style={{ borderBottomLeftRadius: 0 }}>
                                            {item.contents}
                                        </div>
                                        <div className={AdDirectCss.createDateTime}>{item.createDateTime}</div>
                                    </div>
                                    :
                                    <div className={AdDirectCss.inquiryItem} style={{ alignSelf: "end" }}>
                                        <div className={AdDirectCss.createDateTime}>{item.createDateTime}</div>
                                        <div className={AdDirectCss.inquiryContent}
                                            style={{ borderBottomRightRadius: 0 }}
                                        >
                                            {item.contents}
                                        </div>
                                        <div className={AdDirectCss.sendMsgT}></div>
                                    </div>
                                )
                                )}
                            </>
                        )}
                </div>
                <div className={AdDirectCss.writeQnAContentBox}>
                    <div id="inputContent">
                        <textarea
                            style={{ whiteSpace: "pre-line" }}
                            value={deValue}
                            onChange={(e) => updateAnswer(e.target.value)}
                            placeholder="내용을 입력하세요" />
                    </div>
                    <button onClick={sendContent}>
                        <SendIcon style={{ fill: "white" }} />
                    </button>
                </div>
            </div>
            <BtnModal
                showBtnModal={showModal}
                setShowBtnModal={setShowModal}
                btnText="확인"
                modalContext={modalMsg}
            />
        </div>
    )
}

export default AdminDirectPage;