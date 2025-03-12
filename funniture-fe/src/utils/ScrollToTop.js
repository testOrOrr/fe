import { useEffect } from "react";
const { useLocation } = require("react-router-dom");

// 페이지 이동 시 스크롤 올리기
function ScrollToTop() {

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default ScrollToTop