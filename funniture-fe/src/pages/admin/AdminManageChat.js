import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteChatItemAPI, getChatQaList, updateChatQaList } from "../../apis/ChatAPI";
import AdManaChatCss from './AdminmanageChat.module.css'
import BtnModal from '../../component/BtnModal.js'

function AdminManageChat() {
    // 질문 관리 부분
    const [selectLevel, setSelectLevel] = useState(1)
    const { chatQaList } = useSelector(state => state.chat)
    const { refList } = useSelector(state => state.chat)
    const [currentList, setCurrentList] = useState([])
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [deValue, setDeValue] = useState({}); // 입력 값 임시 저장
    const [modalMsg, setModalMsg] = useState('')
    const [showBtnModal, setShowBtnModal] = useState(false)

    const dispatch = useDispatch();

    const [listBoxScroll, setListBoxScroll] = useState(false)

    const [chatItem, setChatItem] = useState([
        {
            chatQaNo: null,
            chatQaLevel: 1,
            chatQaQuContent: '',
            chatQaAnContent: '',
            nextQuAbsence: false,
            adminConnectAbsence: false,
            refQuNo: null
        }
    ]);

    function getListData() {
        console.log("현재 볼 단계 : ", selectLevel)
        dispatch(getChatQaList({ levelNum: selectLevel }))
    }

    useEffect(() => {
        getListData()
    }, [selectLevel])

    useEffect(() => {
        console.log("chatQaList : ", chatQaList)
        console.log("refList : ", refList)

        setCurrentList(chatQaList)
    }, [chatQaList])

    useEffect(() => {
        console.log("currentList : ", currentList)

        currentList.forEach(item => {
            const textarea = document.querySelector(`textarea[data-textarea-id='${item.chatQaNo}']`);

            if (textarea) {
                // 변경전 초기화 먼저
                textarea.style.height = 'auto'
                textarea.style.height = `${textarea.scrollHeight + 10}px`
            }
        });

        // DOM 업데이트가 끝난 후 실행
        setTimeout(() => {
            const listBox = document.querySelector(".listBox");
            const contentTitle = document.querySelector(".contentTitle");

            if (listBox && contentTitle) {
                listBox.style.height = `calc(100% - ${contentTitle.offsetHeight}px)`;
            }
        }, 0); // setTimeout을 0으로 설정하면 다음 이벤트 루프로 실행됨
    }, [currentList])

    const handleChange = (id, value, object) => {
        console.log("클릭 받은 것 id : ", id, " value : ", value, " object : ", object)

        setCurrentList((prev) =>
            prev.map((item) =>
                item.chatQaNo === id ? { ...item, [object]: value } : item
            )
        );
    }

    // 답변 업데이트 디바운스 적용
    function updateAnswer(id, value, object) {
        setDeValue(prev => ({
            ...prev,
            [id]: value
        }))

        const textarea = document.querySelector(`textarea[data-textarea-id='${id}']`);

        // 변경전 초기화 먼저
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight + 10}px`

        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }

        const newTimeOut = setTimeout(() => {
            handleChange(id, value, object)
        }, 500)

        setTypingTimeout(newTimeOut)
    }

    async function saveChatQaList() {
        const msg = await updateChatQaList({ updateList: currentList })

        setModalMsg(msg)
        setShowBtnModal(true)
    }

    function onDeleteSuccess() {
        getListData()
    }

    useEffect(() => {
        if (listBoxScroll) {
            const listBox = document.querySelector(".listBox");
            listBox.scrollTo({ top: listBox.scrollHeight, behavior: "smooth" })
            setListBoxScroll(false)
        }
    }, [listBoxScroll])

    // 추가
    function addChatItem() {
        setListBoxScroll(true)

        // 기존 리스트에서 'new'로 시작하는 항목 개수 확인
        const newItemsCount = currentList?.filter(item => String(item.chatQaNo)?.startsWith("new")).length;

        const newItem = {
            chatQaNo: `new${newItemsCount + 1}`,
            chatQaLevel: selectLevel,
            chatQaQuContent: '',
            chatQaAnContent: '',
            nextQuAbsence: false,
            adminConnectAbsence: false,
            refQuNo: refList?.length > 0 ? refList[0]?.chatQaNo : null
        }

        setDeValue(prev => ({ ...prev, [`new${newItemsCount + 1}`]: '' }))

        setCurrentList(prev => [...prev, newItem])
    }

    // 삭제
    async function deleteChatItem(number) {
        const msg = await deleteChatItemAPI({ chatNo: number })

        setModalMsg(msg)
        setShowBtnModal(true)
    }

    return (
        <div className={AdManaChatCss.questionListContainer}>
            <div className={AdManaChatCss.questionListLevelBox}>
                <input type="radio" name="levelCheck" id="level1" value={1}
                    onChange={(e) => setSelectLevel(e.target.value)}
                    checked={selectLevel == 1 ? true : false}
                />
                <label htmlFor="level1">1단계 질문</label>
                <input type="radio" name="levelCheck" id="level2" value={2}
                    onChange={(e) => setSelectLevel(e.target.value)}
                    checked={selectLevel == 2 ? true : false}
                />
                <label htmlFor="level2">2단계 질문</label>
                <input type="radio" name="levelCheck" id="level3" value={3}
                    onChange={(e) => setSelectLevel(e.target.value)}
                    checked={selectLevel == 3 ? true : false}
                />
                <label htmlFor="level3">3단계 질문</label>
            </div>
            <div className={AdManaChatCss.btnBox}>
                <button onClick={addChatItem}>추가 +</button>
                <button onClick={saveChatQaList}>저장하기</button>
            </div>
            <div className={AdManaChatCss.contentBox}>
                <div className={`${AdManaChatCss.contentItem} ${AdManaChatCss.contentTitle} contentTitle`}>
                    {selectLevel >= 2 ?
                        <div className={AdManaChatCss.refQu}>상위 질문</div>
                        : null}
                    <div className={AdManaChatCss.question}>질문</div>
                    <div className={AdManaChatCss.answer}>답변</div>
                    <div className={AdManaChatCss.nextQu} style={{ display: selectLevel == 3 ? "none" : "block" }}>하위 질문 여부</div>
                    <div className={AdManaChatCss.adminAble}>관리자 연결 여부</div>
                    <div className={AdManaChatCss.deleteBtn}>삭제</div>
                </div>

                <div className={`listBox ${AdManaChatCss.listBox}`}>

                    {currentList?.length > 0 ? currentList?.map(item => (
                        <div className={AdManaChatCss.contentItem}>
                            {selectLevel >= 2 ?
                                <div className={AdManaChatCss.refQu}>
                                    <div>
                                        <select name="refQuNo" id="refQuNo" value={item.refQuNo}
                                            onChange={(e) => handleChange(item.chatQaNo, parseInt(e.target.value), e.target.id)}
                                        >
                                            {refList?.map(refItem => (
                                                <option value={refItem.chatQaNo}>
                                                    {refItem.chatQaQuContent}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                : null}

                            <div className={AdManaChatCss.question}>
                                <input type="text" value={item.chatQaQuContent} id="chatQaQuContent"
                                    onChange={(e) => handleChange(item.chatQaNo, e.target.value, e.target.id)}
                                />
                            </div>
                            <div className={AdManaChatCss.answer}>
                                <textarea style={{ whiteSpace: "pre-line", height: `${(deValue[item.chatQaNo]?.scrollHeight + 10)}px` }} type="text" id="chatQaAnContent"
                                    data-textarea-id={item.chatQaNo}
                                    value={deValue[item.chatQaNo] ?? item.chatQaAnContent}
                                    onChange={(e) => updateAnswer(item.chatQaNo, e.target.value, e.target.id)}
                                />
                            </div>
                            <div className={AdManaChatCss.nextQu}>
                                <div>
                                    <input type="checkbox" id="nextQuAbsence"
                                        checked={item.nextQuAbsence}
                                        onChange={(e) => handleChange(item.chatQaNo, !item.nextQuAbsence, e.target.id)}
                                    />
                                </div>
                            </div>
                            <div className={AdManaChatCss.adminAble} style={{ display: selectLevel == 3 ? "none" : "block" }}>
                                <div>
                                    <input type="checkbox" id="adminConnectAbsence"
                                        checked={item.adminConnectAbsence}
                                        onChange={(e) => handleChange(item.chatQaNo, !item.adminConnectAbsence, e.target.id)}
                                    />
                                </div>
                            </div>
                            <div className={AdManaChatCss.deleteBtn}>
                                <div>
                                    <button>
                                        <img src={require("../../assets/icon/minus-solid.svg").default} alt="삭제 버튼"
                                            onClick={() => deleteChatItem(item.chatQaNo)} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) :
                        <div>등록 된 질문이 없습니다.</div>
                    }
                </div>
            </div>
            <BtnModal
                showBtnModal={showBtnModal}
                setShowBtnModal={setShowBtnModal}
                btnText="확인"
                modalContext={modalMsg}
                onSuccess={onDeleteSuccess}
            />
        </div>
    )
}

export default AdminManageChat