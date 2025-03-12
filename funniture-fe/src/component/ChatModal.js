import { Button, Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatCss from './ChatModal.module.css'
import { createElement, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getChatQaList } from "../apis/ChatAPI";
import adminLogo from '../assets/images/white_chiar_logo.png'
import { useLocation } from "react-router-dom";
import BtnModal from './BtnModal'
import { changeConsultingAPI } from "../apis/MemberAPI";
import { ReactComponent as SendIcon } from '../assets/icon/send-icon.svg'
import { getUSerInquiryList, sendChat } from "../apis/AdminInquiryAPI";

function ChatModal({ showBtnModal, setShowBtnModal }) { // 25-02-27 attachmentFile 추가

    const { chatQaList } = useSelector(state => state.chat)
    const { user } = useSelector(state => state.member)
    const [currentList, setCurrentList] = useState();
    const [selectNum, setSelectNum] = useState();

    // 관리자 연결여부
    const [adminAble, setAdminAble] = useState(false)
    // 로그인 여부 모달
    const [needLoginModal, setNeedLoginModal] = useState(false)
    const [loginModalMsg, setLoginModalMsg] = useState('')

    // 이전 질문
    const [prevList, setPrevList] = useState(null);

    // 처음 질문
    const firstList = useRef();

    // 이전 선택한 질문의 번호
    const prevSelectNo = useRef();

    // 입력창 값 관리
    const [deValue, setDeValue] = useState('')

    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getChatQaList());
    }, [])

    // 1:1 문의 연결
    const [inquiryList, setInquiryList] = useState([])

    useEffect(() => {
        console.log("새로받아온 chatQaList : ", chatQaList)
        setCurrentList(chatQaList)

        if (!firstList?.current?.length > 0) {
            firstList.current = chatQaList
        }
    }, [chatQaList])

    useEffect(() => {
        if (firstList?.current?.length > 0) {
            setCurrentList(firstList.current)
        }
    }, [location.pathname])

    // header의 x버튼이 눌렸을때 동작할 함수
    const handleOnClose = () => {
        if (firstList?.current?.length > 0) {
            setCurrentList(firstList.current)
        }
        setShowBtnModal(false); // 모달 닫기
    };

    function selectChatList(num) {
        // prevList.current = { list: currentList, adminAble: adminAble }

        setPrevList({ list: currentList, adminAble: adminAble })
        prevSelectNo.current = selectNum

        // 선택 질문
        const selectQu = currentList.filter((item) => item.chatQaNo == num)

        // 선택 질문 내용
        const selectQuestion = selectQu[0].chatQaQuContent

        // 응답
        const response = selectQu[0].chatQaAnContent

        // 관리자 연결 여부
        setAdminAble(selectQu[0].adminConnectAbsence)

        // 관리자 여부에 따라 currentList 에 연결 여부 넣을꺼라서 setAdminAble 뒤에 selectNum 변경
        setSelectNum(num)

        // 사용자쪽
        const userBox = document.createElement("div")
        userBox.classList.add("receiver", ChatCss.receiver);
        userBox.innerHTML = `
            <div class="${ChatCss.receiverMsgBox}">
                <div class="${ChatCss.receiverMsg}">${selectQuestion}</div>
            </div>
        `

        const adminAll = document.querySelectorAll(".sender")
        const lastAdmin = adminAll[adminAll?.length - 1];

        if (lastAdmin) {
            lastAdmin.insertAdjacentElement("afterend", userBox);
        } else {
            console.log("lastAdmin 요소 찾을 수 없음")
        }

        // 관리자 쪽
        const adminBox = document.createElement("div")
        adminBox.classList.add("sender", ChatCss.sender);
        adminBox.innerHTML = `
        <div class="${ChatCss.senderImg}">
            <img src="${adminLogo}" alt=로고 이미지" />
        </div>
        <div class="${ChatCss.senderMsgBox}">
            <div class="${ChatCss.senderMsg}">${response}</div>
        </div>
        `

        const receiverAll = document.querySelectorAll(".receiver")
        const lastReceiver = receiverAll[receiverAll.length - 1];

        if (lastReceiver) {
            lastReceiver.insertAdjacentElement("afterend", adminBox);
        } else {
            console.log("lastReceiver 요소 찾을 수 없음")
        }

        // 스크롤 내리기
        const chatBox = document.querySelector(".chatBox");  // modalBody에 접근

        const adminBoxHeight = adminBox.getBoundingClientRect().height;  // adminBox 높이
        const userBoxHeight = userBox.getBoundingClientRect().height;  // userBox 높이

        if (chatBox) {
            chatBox.style.scrollBehavior = 'smooth';
            chatBox.scrollTop = chatBox.scrollHeight - adminBoxHeight - userBoxHeight;  // 스크롤 설정
        } else {
            console.log("chatBox 요소 찾을 수 없음");
        }
    }

    useEffect(() => {
        console.log("==============================================================")
    }, [currentList])

    useEffect(() => {
        dispatch(getChatQaList({ refNum: selectNum }))
    }, [selectNum])

    function changeToPrevList() {

        setAdminAble(prevList.adminAble)
        setSelectNum(prevSelectNo.current)
        setCurrentList(prevList.list)
    }

    function setFirstList() {
        setSelectNum()
        setPrevList({ list: firstList.current })
        setCurrentList(firstList.current)
    }

    // 관리자에게 연결 1:1 문의
    async function getUserChatData(memberId) {
        const response = await getUSerInquiryList({ memberId })

        if (response.httpStatusCode == 200) {
            setInquiryList(response.results.result)
        }
    }

    useEffect(() => {
        console.log("user정보 : ", user)
        if (user) {
            console.log("user정보 : ", user)

            if (user.isConsulting) {
                getUserChatData(user.memberId)
            }
        }
    }, [user])

    useEffect(() => {
        console.log("사용자의 상담 내역 : ", inquiryList)
        const textareaBox = document.querySelector(`#modalFooter`);
        const chatBox = document.querySelector("#directChatBox")

        if (chatBox) {
            chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
            textareaBox.style.height = 'auto'
        }
    }, [inquiryList])

    async function changeConsulting() {
        console.log("관리자 연결 클릭 : ", user)
        if (!user || user.memberId == '') {
            setNeedLoginModal(true)
            setLoginModalMsg('관리자와의 상담을 위해서는 로그인이 필요합니다.')
            return;
        }
        if (user) {
            if (firstList?.current?.length > 0) {
                setCurrentList(firstList.current)
            }
            dispatch(changeConsultingAPI({ memberId: user.memberId }))
        }
    }

    async function sendNewChat() {
        console.log("메세지 보내기 : ", user?.memberId)
        if (user.memberId != '') {
            const newChat = {
                senderNo: user.memberId,
                receiveNo: "ADMIN",
                contents: deValue
            }

            console.log(newChat)
            await sendChat({ newChat })
            getUserChatData(user.memberId)
            setDeValue('')
        }
    }

    function updateInputBox(value) {
        setDeValue(value)

        const textareaBox = document.querySelector(`#modalFooter`);
        const textarea = document.querySelector(`#sendContent`);

        // 변경전 초기화 먼저
        textareaBox.style.height = 'auto'
        textareaBox.style.height = `${textarea.scrollHeight + 20}px`
    }


    return (
        <>
            <Modal show={showBtnModal}
                onHide={handleOnClose}
                className={ChatCss.modalCss}
                size='md'
                dialogClassName={ChatCss.customModal}
                contentClassName={ChatCss.modalContent}
                backdropClassName={ChatCss.backDrop}
            >
                <Modal.Header closeButton className={ChatCss.modalHeader} onHide={handleOnClose}>
                    <div>
                        <div>
                            <div className={ChatCss.imgBox}>
                                <img src={require("../assets/images/a.jpg")} alt="로고 이미지" />
                            </div>
                            <div className={ChatCss.siteInfo}>
                                <div>Funniture</div>
                                <div>운영시간 : 9:00 ~ 18:00</div>
                            </div>
                        </div>
                        {user?.isConsulting ?
                            <div>
                                <button onClick={changeConsulting}>상담 종료</button>
                            </div>
                            : null}
                    </div>
                </Modal.Header>

                {user?.isConsulting ?
                    <>
                        <Modal.Body className={ChatCss.modalBody} style={{ paddingBottom: 0 }}>
                            <div className={ChatCss.directChatBox} id="directChatBox">
                                {inquiryList.length == 0 ?
                                    <div>상담을 시작해보세요!!</div>
                                    :
                                    <>
                                        {inquiryList.map(item => item.receiveNo == "ADMIN" ?
                                            <div className={ChatCss.directChatItem} style={{ alignSelf: "end" }} key={item.inquiryAdminNo}>
                                                <div className={ChatCss.sendTime}>{item.createDateTime}</div>
                                                <div className={ChatCss.chatContent}
                                                    style={{ borderBottomRightRadius: 0 }}
                                                >
                                                    {item.contents}
                                                </div>
                                                <div className={ChatCss.chatRight}></div>
                                            </div>
                                            : <div className={ChatCss.directChatItem} style={{ justifyContent: "start" }} key={item.inquiryAdminNo}>
                                                <div className={ChatCss.chatLeft}></div>
                                                <div className={ChatCss.chatContent}
                                                    style={{ borderBottomLeftRadius: 0 }}
                                                >
                                                    {item.contents}
                                                </div>
                                                <div className={ChatCss.sendTime}
                                                    style={{ textAlign: "start" }}
                                                >
                                                    {item.createDateTime}
                                                </div>
                                            </div>
                                        )}
                                    </>

                                }
                            </div>
                        </Modal.Body>
                        <Modal.Footer className={ChatCss.modalFooter} id="modalFooter">
                            <div className={ChatCss.inputBox} id="inputBox">
                                <textarea
                                    id="sendContent"
                                    value={deValue}
                                    onChange={(e) => updateInputBox(e.target.value)}
                                />
                                <button onClick={sendNewChat}>
                                    <SendIcon className={ChatCss.sendIcon} />
                                </button>
                            </div>
                        </Modal.Footer>
                    </>
                    :
                    <Modal.Body className={ChatCss.modalBody}>
                        <div className={`chatBox ${ChatCss.chatBox}`}>
                            <div className={`sender ${ChatCss.sender}`}>
                                <div className={ChatCss.senderImg}>
                                    <img src={require("../assets/images/white_chiar_logo.png")} alt="" />
                                </div>
                                <div className={ChatCss.senderMsgBox}>
                                    <div className={ChatCss.senderMsg}>
                                        안녕하세요 고객님😊
                                        <br />어떤게 궁금하신가요?
                                    </div>
                                </div>
                            </div>


                            <div className={ChatCss.receiver}>
                                <div className={ChatCss.receiverButtonBox}>
                                    {currentList?.length > 0 ? currentList[0].chatQaLevel >= 2
                                        ? (
                                            <>
                                                {currentList.map((item) => (
                                                    <button data-chat-no={item.chatQaNo}
                                                        className={ChatCss.receiverButton}
                                                        onClick={() => selectChatList(item.chatQaNo)}
                                                    >
                                                        {item.chatQaQuContent}
                                                    </button>
                                                ))}
                                                <button className={ChatCss.receiverButton} onClick={changeToPrevList}>이전 질문 보기</button>
                                                {currentList[0].chatQaLevel == 2 ? null :
                                                    <button className={ChatCss.receiverButton} onClick={setFirstList}>처음 질문 보기</button>
                                                }
                                            </>
                                        )
                                        : (currentList.map((item) => (
                                            <button data-chat-no={item.chatQaNo}
                                                className={ChatCss.receiverButton}
                                                onClick={() => selectChatList(item.chatQaNo)}
                                            >
                                                {item.chatQaQuContent}
                                            </button>
                                        )))
                                        :
                                        <>
                                            <button className={ChatCss.receiverButton} onClick={setFirstList}>처음 질문 보기</button>
                                        </>
                                    }

                                    {/* 관리자 연결 버튼 */}
                                    {(adminAble || prevList?.list[0].chatQaLevel == 3) ?
                                        <button className={ChatCss.receiverButton} onClick={changeConsulting}>관리자에게 문의 하기</button>
                                        : null}
                                </div>
                                {/* <div className={ChatCss.receiverMsgBox}>
                                <div className={ChatCss.receiverMsg}>받는 놈 메세지</div>
                                <div className={ChatCss.receiverMsg}>받는 놈 메세지asda asdslnc</div>
                                <div className={ChatCss.receiverMsg}>받는 놈</div>
                                <div className={ChatCss.receiverMsg}>받는 놈 메세지</div>
                                <div className={ChatCss.receiverMsg}>받는 놈 메세지</div>
                                <div className={ChatCss.receiverMsg}>받는 놈 메세지</div>
                            </div> */}
                            </div>
                        </div>
                    </Modal.Body>
                }

            </Modal>

            <BtnModal
                showBtnModal={needLoginModal}
                setShowBtnModal={setNeedLoginModal}
                modalContext={loginModalMsg}
                btnText="확인"
            />
        </>
    );

}

export default ChatModal;