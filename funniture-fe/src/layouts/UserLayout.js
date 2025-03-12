import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Header from "../component/Header"
import Footer from "../component/Footer"
import './userLayout.css'
import banner1 from '../assets/images/banner(3).jpg'
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { getOwnerListByCategory } from "../apis/ProductAPI"
import TopDownBtn from "../component/TopDownBtn"

function UserLayout({ selectCategory, setSelectCategory, selectCompany, setSelectCompany }) {

    const location = useLocation();
    const navigate = useNavigate();

    const [storeList, setStoreList] = useState([])

    // 상위 카테고리에 의해 고정되는 카테고리 리스트와 제공자 리스트
    const { categoryList, refCategoryCode } = useSelector(state => state.category);

    if (location.state?.categoryCodeList) {
        if (!selectCategory.includes(parseInt(location.state?.categoryCodeList))) {
            setSelectCategory([parseInt(location.state.categoryCodeList)])
        }
        console.log("location.state : ", location.state)
    }

    // 메인페이지에서 이동할 때(제일 처음 초기 카테고리 추가 및 초기화)
    function moveListPage(categoryCode) {
        setSelectCategory([categoryCode]);

        navigate('/list')
    }

    // 리스트 페이지에서 이미 들어있는 곳에 1 또는 2 가 있다면 추가할때 지우고 넣기기
    function addSelectCategory(categoryCode) {
        if (categoryCode != 1 && categoryCode != 2) {
            if (selectCategory.includes(1) || selectCategory.includes(2)) {
                setSelectCategory([categoryCode])
            } else {
                // 이미 들어 있으면 삭제를 위해 진행
                if (selectCategory.includes(categoryCode)) {
                    setSelectCategory(prev => prev.filter(item => item !== categoryCode))
                } else {
                    setSelectCategory(prev => [...prev, categoryCode])
                }
            }
        }
    }

    function addSelectStore(ownerNo) {
        // 이미 들어 있으면 삭제를 위해 진행
        if (selectCompany.includes(ownerNo)) {
            setSelectCompany(prev => prev.filter(item => item !== ownerNo))
        } else {
            setSelectCompany(prev => [...prev, ownerNo])
        }
    }

    // 선택 카테고리별 제공자 리스트 세팅
    async function getOwnerData(selectCategory) {

        const ownerListResponse = await getOwnerListByCategory(selectCategory, refCategoryCode)

        if (ownerListResponse.results?.result) {
            setStoreList(ownerListResponse.results.result)
        } else {
            setStoreList([])
        }
    }

    // 만약 카테고리에 따른 제공자 리스트에 없는 제공자가 setSelectCompany에 들어있다면 제거하기
    useEffect(() => {
        setSelectCompany(prev => prev.filter(ownerNo => storeList.some(store => store.owner_no == ownerNo)))
    }, [storeList])

    // 제공자 리스트 가져오기
    useEffect(() => {
        getOwnerData(selectCategory)
    }, [selectCategory])

    function resetConditions() {
        setSelectCategory([])
        setSelectCompany([])

        navigate('/list', { state: { searchText: '' } })

        console.log("document.querySelector('.searchBox input') : ", document.querySelector('.searchBox input'))
        document.getElementById('headerSearchText').value = ('')
    }

    return (
        <div className="layout">
            <Header setSelectCategory={setSelectCategory} />

            <TopDownBtn />

            {/* 사이트 메인페이지 배너 때문에 생성 */}
            {location.pathname == '/' ? (
                <div>
                    < img className='bannerImg' src={banner1} alt="배너 사진 1" />
                    <div className="categoryBtns">
                        <div onClick={() => moveListPage(refCategoryCode)}>
                            <div className="allProduct" >전체보기</div>
                        </div>

                        {categoryList?.map(category => {
                            return (
                                <div key={category.categoryCode} onClick={() => moveListPage(category.categoryCode)}>
                                    <div>{category.categoryName}</div>
                                    <img src={require(`../assets/images/${category.categoryImage}`)} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : null}

            {/* 리스트 페이지 검색 조건 때문에 생성 */}
            {location.pathname == '/list' ? (
                <div className="searchConditionBox">
                    <div className="categoryList">
                        {categoryList?.map(category => {
                            return (
                                <div key={category.categoryCode} data-category-code={category.categoryCode}
                                    className={`categoryItem ${selectCategory?.includes(category.categoryCode) ? 'selectedCategory' : null}`}
                                    onClick={() => addSelectCategory(category.categoryCode)}>
                                    <div>{category.categoryName}</div>
                                </div>
                            )
                        })}
                    </div>
                    <hr />
                    <div className="companyList">
                        <div>
                            {storeList?.map(store => {
                                return (
                                    <div key={store.owner_no} data-owner-no={store.owner_no}
                                        className={`companyItem ${selectCompany?.includes(store.owner_no) ? 'selectedCompany' : null}`}
                                        onClick={() => addSelectStore(store.owner_no)}>
                                        <div>{store.store_name}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="clearConditions" onClick={resetConditions}>초기화</div>
                    </div>
                </div>
            ) : null}

            {/* 기본 레이아웃 */}
            <div className="mainContent" style={location.pathname != '/' ? { "marginTop": "1.5%" } : null}>
                {/* 내용 변경 위치 */}
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default UserLayout