import React, { useState, useEffect } from 'react';
import paginationCss from './pagination.module.css';

const Pagination = ({ pageInfo, onPageChange }) => {
    // pageInfo가 없을 경우 렌더링을 하지 않도록 처리
    if (!pageInfo) {
        return null;  // 페이지네이션이 필요한 경우에만 렌더링
    }

    const { total, cri } = pageInfo;
    const { pageNum, amount} = cri;

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(total / amount);

    // 페이지 번호 배열 생성
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    // 페이지 이동 함수
    const handlePageChange = (pageNum) => {
        onPageChange(pageNum); // 페이지 변경을 부모 컴포넌트에 전달
    };

    return (
        <div className={paginationCss.pagination}>
            {/* 이전 페이지 버튼 */}
            <img
                src={require(`../assets/icon/angles-left-solid.svg`).default}
                alt="페이지 맨앞으로 가는 아이콘"
                onClick={() => pageNum > 1 && handlePageChange(1)}  // 맨앞 페이지
                className={pageNum > 1 ? '' : paginationCss.disabled}
            />
            <img
                src={require(`../assets/icon/angle-left-solid.svg`).default}
                alt="페이지 이전 아이콘"
                onClick={() => pageNum > 1 && handlePageChange(pageNum - 1)}  // 이전 페이지
                className={pageNum > 1 ? '' : paginationCss.disabled}
            />

            {/* 페이지 번호 */}
            {pages.map((page) => (
                <span
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${paginationCss.pageNumber} ${page === pageNum ? paginationCss.selected : ''}`}
                >
                    {page}
                </span>
            ))}

            {/* 다음 페이지 버튼 */}
            <img
                src={require(`../assets/icon/angle-right-solid.svg`).default}
                alt="페이지 다음 아이콘"
                onClick={() => pageNum < totalPages && handlePageChange(pageNum + 1)}  // 다음 페이지
                className={pageNum < totalPages ? '' : paginationCss.disabled}
            />
            <img
                src={require(`../assets/icon/angles-right-solid.svg`).default}
                alt="페이지 맨뒤로 가는 아이콘"
                onClick={() => pageNum < totalPages && handlePageChange(totalPages)}  // 맨뒤 페이지
                className={pageNum < totalPages ? '' : paginationCss.disabled}
            />
        </div>
    );
};
export default Pagination
