import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

function UserRouter() {

    const { user } = useSelector(state => state.member)

    const navigate = useNavigate();

    // 일반 사용자가 아닌 경우 홈 페이지로 리디렉트
    useEffect(() => {
        if (user.memberId != '') {
            if (user.memberRole != "USER") {
                navigate("/restrict")
            }
        }
    }, [user])

    // 로그인된 경우 정상적으로 해당 컴포넌트를 렌더링
    return <Outlet />;
}

export default UserRouter;