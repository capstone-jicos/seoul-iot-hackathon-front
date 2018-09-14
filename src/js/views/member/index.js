/**
 * @file 사용자 목록 페이지(views/member/index.html)에 대한 Script 정의
 */

/**
 * @description 회원 검색 조건을 수집하여 FormData Object 에 추가함
 * @returns {FormData} Version 2 서비스명과 (검색 조건이 있을 경우)
 *                     검색 조건이 들어있는 FormData 객체
 */
function getMemberSearchCondition() {
    let data = new FormData();
    let inputData = document.getElementsByClassName('search-input');
    let optionData = document.getElementsByClassName('search-option');

    document.getElementById('table-content').innerHTML = null;
    data.append('func', 'list_user');
    data.append('max-line', getMaxLine());

    for (let i = 0, len = inputData.length; i < len; i++) {
        if (inputData[i].value !== '') {
            let key = inputData[i].id.replace('search-', '');
            data.append(key, inputData[i].value);
        }
    }

    for (let i = 0, len = optionData.length; i < len; i++) {
        if (optionData[i].selectedIndex !== 0) {
            let key = optionData[i].id.replace('search-', '');
            data.append(key, optionData[i].value);
        }
    }

    return data;
}

/**
 * @description 회원 목록을 서버에 요청 후 페이지에 표지
 * @param page 목록에 표시할 페이지. 0부터 시작함
 *             예를 들어, 화면의 1페이지는 0으로 들어감 (Version 2 서버의 페이지 계산법 때문)
 */
function getMemberList(page = 0) {
    fetchData('/api', {method: 'GET'}, function (resp) {
        console.log(resp);
    });
}

/**
 * @description 회원 목록 페이지 로딩 후 필요한 설정 진행
 */
function initMemberList() {
    getMemberList(0);
    addClickListener(document.getElementById('search-submit'), getMemberList, null);
}

initMemberList();