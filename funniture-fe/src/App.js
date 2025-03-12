import { Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import Main from './pages/common/Main'
import MyPage from './pages/user/MyPage';
import OwnerMyPage from './pages/owner/OwnerMyPage';
import Test from './pages/Test';
import Rental from './pages/admin/Rental';
import AuthorityLayout from './layouts/AuthorityLayout';
import AdminMain from './pages/admin/AdminMain';
import AdminUser from './pages/admin/AdminUser';
import ListPage from './pages/common/ListPage';
import { useEffect, useMemo, useState } from 'react';
import Login from './pages/login/Login';
import Signup from './pages/login/Singup';
import OwnerProducts from './pages/owner/OwnerProducts';
import AdminProduct from './pages/admin/AdminProduct';
import Inquiry from './pages/common/Inquiry';
import Orders from './pages/user/Orders';
import { useDispatch, useSelector } from 'react-redux';
import { callGetMemberAPI } from './apis/MemberAPI';
import decodeJwt from './utils/tokenUtils';
import OwnerRegister from './pages/owner/OwnerRegister';
import ProductDetailPage from './pages/common/ProductDetailPage';
import DetailOrder from './pages/user/DetailOrder';
import OrdersReturn from './pages/user/OrdersReturn';
import RentalRegist from './pages/user/RentalRegist';
import FindPass from './pages/login/FindPass';
import UserConform from './pages/user/UserConform';
import EditsInfo from './pages/user/EditsInfo';
import { resetMember } from './redux/modules/MemberModule';
import OwnerRental from './pages/owner/OwnerRental';
import FavoritesPage from './pages/user/FavoritesPage';
import RecentProduct from './pages/user/Recentproduct';
import Convert from './pages/user/Convert';
import AppConvert from './pages/user/AppConvert';
import AdminOwner from './pages/admin/AdminOwner';
import AdminLeaver from './pages/admin/AdminLeaver';
import AdminConvert from './pages/admin/AdminConvert';
import NotFoundPage from './pages/common/NotFoundPage';
import LoginRouter from './layouts/LoginRouter';
import UserRouter from './layouts/UserRouter';
import AdminQnAPage from './pages/admin/AdminQnAPage';
import DeliveryAddress from './pages/user/DeliveryAddress';
import OrderReturnRegist from './pages/user/OrderReturnRegist';
import OwnerInquiry from './pages/owner/OwnerInquiry';
import NotAllow from './pages/common/NotAllow';
import UserInquiry from './pages/user/UserInquiry';
import UserReview from './pages/user/UserReview';
import AdminNotice from './pages/admin/AdminNotice';
import Notice from './pages/common/Notice';
import OwnerReview from './pages/owner/OwnerReview';
import OwnerInfo from './pages/owner/OwnerInfo';
import OwnerNotice from './pages/owner/OwnerNotice';
import OwnerNoticeDetail from './pages/owner/OwnerNoticeDetail';
import AdminSales from './pages/admin/AdminSales';
import OwnerSales from './pages/owner/OwnerSales';

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    console.log("토큰 세팅")
    if (window.localStorage.getItem("accessToken")) {
      setToken(decodeJwt(window.localStorage.getItem("accessToken")))
    }
  }, [window.localStorage.getItem("accessToken")])

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("token : ", token)
    if (token && token.sub) {
      console.log("유효한 토큰:", token);
      dispatch(callGetMemberAPI({ memberId: token.sub }));
    } else {
      console.error("유효하지 않은 토큰 또는 sub 값 없음!");
      dispatch(resetMember()); // 유효하지 않은 경우 Redux 상태 초기화
    }
  }, [token]);

  // 선택한 검색 카테고리 관리
  const [selectCategory, setSelectCategory] = useState([])
  const [selectCompany, setSelectCompany] = useState([])

  const { user } = useSelector(state => state.member)

  useEffect(() => {
    if (user) {
      if (user.memberRole == "ADMIN" || user.memberRole == "OWNER") {
        if (localStorage.getItem("recent")) {
          localStorage.removeItem("recent")
        }
      } else {
        const existingRecent = localStorage.getItem("recent");

        if (existingRecent === null) { // only when there is no recent data
          localStorage.setItem("recent", JSON.stringify([]));
        }
      }
    }
  }, [user])

  return (
    <Routes>
      <Route path='/' element={<UserLayout selectCategory={selectCategory} setSelectCategory={setSelectCategory}
        selectCompany={selectCompany} setSelectCompany={setSelectCompany} />} >

        {/* 공통 페이지(권한 없어도 접근 가능) */}
        <Route index element={<Main />} />

        <Route path='list' element={<ListPage selectCategory={selectCategory} selectCompany={selectCompany} />} />
        <Route path='/product/:id' element={<ProductDetailPage />} />
        <Route path='/notice' element={<Notice />} />

        {/* 로그인이 필요 */}
        <Route element={<LoginRouter />}>

          <Route path='/rental' element={<RentalRegist />} />

          {/* 일반 사용자 로그인 필요 */}
          <Route element={<UserRouter />}>

            <Route path='/mypage' element={<MyPage />}>
              <Route index element={<Orders />} />
              <Route path='orders/:id' element={<DetailOrder />} />
              <Route path='returns' element={<OrdersReturn />} />
              <Route path='return/:id' element={<OrderReturnRegist />} />
              <Route path='edit' element={<UserConform />} />
              <Route path='edits' element={<EditsInfo />} />
              <Route path='favorites' element={<FavoritesPage />} />
              <Route path='recent' element={<RecentProduct />} />
              <Route path='convert' element={<Convert />} />
              <Route path='appConvert' element={<AppConvert />} />
              <Route path='deliveryaddress' element={<DeliveryAddress />} />
              <Route path='inquiry' element={<UserInquiry />} />
              <Route path='review' element={<UserReview />} />
            </Route>

          </Route>

          <Route path='test' element={<Test />} />
          <Route path='inquiry' element={<Inquiry />} />

          {/* 제공자 로그인 필요 */}
          <Route path='/owner' element={<OwnerLayout />}>
            <Route index element={<OwnerMyPage />} />
            <Route path='product' element={<OwnerProducts />} />
            <Route path='register' element={<OwnerRegister />} />
            <Route path='edit' element={<OwnerRegister />} />
            <Route path='rentals' element={<OwnerRental />} />
            <Route path='inquiry' element={<OwnerInquiry />} />
            <Route path='review' element={<OwnerReview />} />
            <Route path='ownerInfo' element={<OwnerInfo />} />
            <Route path='notice' element={<OwnerNotice />} />
            <Route path='notice/:id' element={<OwnerNoticeDetail />} />
            <Route path='sales' element={<OwnerSales />} />
          </Route>

        </Route>
      </Route>

      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/find' element={<FindPass />} />

      <Route path='*' element={<NotFoundPage />} />
      <Route path='/restrict' element={<NotAllow />} />

      {/* 관리자 로그인 필요 */}
      <Route path='/admin' element={<AdminLayout />}>

        <Route index element={<AdminMain />} />
        <Route path='rentals' element={<Rental />} />

        <Route path='authority' element={<AuthorityLayout />}>
          <Route path='user' element={<AdminUser />} />
          <Route path='owner' element={<AdminOwner />} />
          <Route path='convert' element={<AdminConvert />} />
          <Route path='leaver' element={<AdminLeaver />} />
        </Route>

        <Route path='qna' element={<AdminQnAPage />} />
        <Route path='notice' element={<AdminNotice />} />

        <Route path='product' element={<AdminProduct />} />

        <Route path='sales' element={<AdminSales />} />

      </Route>

    </Routes>
  );
}

export default App;
