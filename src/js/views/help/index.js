/**
 * @file 고객문의 목록 페이지(views/help/index.html)에 대한 Script 정의
 */

/**
 * @description 고객문의 검색 조건을 수집하여 FormData Object 에 추가함
 * @returns {FormData} Version 2 서비스명과 (검색 조건이 있을 경우)
 *                     검색 조건이 들어있는 FormData 객체
 */
function getCaseSearchCondition() {
    let data = new FormData();
    let inputData = document.getElementsByClassName('search-input');
    let optionData = document.getElementsByClassName('search-option');

    document.getElementById('table-content').innerHTML = null;
    data.append('func', 'list_casecall');
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
 * @description 고객문의 목록을 서버에 요청 후 페이지에 표지
 * @param page 목록에 표시할 페이지. 0부터 시작함
 *             예를 들어, 화면의 1페이지는 0으로 들어감 (Version 2 서버의 페이지 계산법 때문)
 */
function getCaseList(page = 0) {
    let data = getCaseSearchCondition();
    data.append('page', page.toString());

    fetchData(data, function (respData) {
        const detailLink = 'help/detail.html?callid=';

        // TODO: 답변여부를 별도로 보여주는 것이 좋을 듯
        // TODO: index.html에 추가는 했으니 백엔드에서만 적용하면 될 듯
        composeList(respData['casecalls'], detailLink, 'callid');

        if (respData['page'] !== undefined) {
            // [PHPStorm Inspection 무시용] doubleh.main.js 에서 이미 선언되어 사용 가능함
            // noinspection JSUndeclaredVariable
            pageGroup = respData['page']['total'];
            // noinspection JSUnresolvedVariable
            currentPage = parseInt(respData['page']['current'])  + 1;
        }

        if (currentPage % 5 === 1) {
            setPagination(currentPage, getCaseList);
        }
    });
}

/**
 * @description 고객문의 목록 페이지 로딩 후 필요한 설정 진행
 */
function initCaseList() {
    getCaseList();
    /** (검색조건 창의) 검색버튼에 대한 Event Listener */
    addClickListener(document.getElementById('search-submit'), getCaseList, null);
}

initCaseList();