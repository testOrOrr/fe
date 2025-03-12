import { useEffect, useState } from 'react';
import btnsCss from './topdownbtn.module.css'
import TestContent from './TestContent';
import ChatModal from './ChatModal';

function TopDownBtn() {

    const [btnShow, setBtnShow] = useState(false)
    const [showBtnModal, setShowBtnModal] = useState(false)

    useEffect(() => {

        const checkHeight = () => {
            setBtnShow(document.documentElement.scrollHeight > window.innerHeight);
        };

        checkHeight();

        const observe = new MutationObserver(() => {
            checkHeight();
        })

        observe.observe(document.querySelector(".mainContent"), { childList: true, subtree: true })

        return () => { observe.disconnect() };
    }, [])

    return (
        <div className={btnsCss.topDownBtns}>
            <div style={{ display: btnShow ? "flex" : "none" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <img src={require('../assets/icon/up-arrow.svg').default} alt="top 스크롤 버튼" />
            </div>
            <div style={{ display: btnShow ? "flex" : "none" }} onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
                <img src={require('../assets/icon/down-arrow.svg').default} alt="down 스크롤 버튼" />
            </div>

            <div className={btnsCss.chatBtn}>
                <div>
                    <img src={require('../assets/images/logo-image-white.png')} alt="채팅 연결 버튼" onClick={() => { setShowBtnModal(!showBtnModal) }} />
                </div>

                <ChatModal
                    showBtnModal={showBtnModal}
                    setShowBtnModal={setShowBtnModal}
                />
            </div>

        </ div>
    )

}

export default TopDownBtn