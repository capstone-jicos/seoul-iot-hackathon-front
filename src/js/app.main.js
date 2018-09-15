'use strict';

/**
 * @description HTML Directive 가 아닌, jQuery 로 직접 Modal 을 띄우기 위한 Function
 * @param modalID 띄울 Modal 의 HTML ID
 */
function toggleModal(modalID) {
    $('#' + modalID).modal();
}

/**
 * @description 목록이 들어있는 페이지에서 페이지네이션 구축을 위한 Wrapper Function
 * (대부분 index.html, Bootstrap에서 제공하는 Pagination Component 활용)
 * @param currentPage 현재 몇 페이지에 있는지
 *                    (주로 PAGE_NO_PER_GROUP 으로 나누어 떨어지는 수 : 1, 6, 11, ...)
 * @param lister      각 페이지 번호에 대한 Event Listener
 *                    (주로 get...List 함수)
 */
function setPagination(currentPage, lister) {
    let paginationForm = document.getElementById('pagination-form').cloneNode(true);
    let paginationPosition = document.getElementById('pagination');
    let previousForm = paginationForm.getElementsByTagName('li')[0];
    let nextForm = paginationForm.getElementsByTagName('li')[2];
    let pageForm = paginationForm.getElementsByTagName('li')[1];

    paginationPosition.innerHTML = null;

    paginationForm.id = 'pagination';
    previousForm.id = 'pagination-previous';
    nextForm.id = 'pagination-next';
    pageForm.removeAttribute('id');

    paginationPosition.innerHTML = null;

    /** (만약 있을 경우,) '이전 페이지' 버튼 추가 */
    if (currentPage % PAGE_NO_PER_GROUP === 1 && currentPage !== 1) {
        addClickListener(previousForm, lister, currentPage - PAGE_NO_PER_GROUP - 1);
        paginationPosition.appendChild(previousForm);
    }

    /** '이전 페이지' 버튼과 '다음 페이지' 사이의 페이지 버튼들 추가 */
    for (let i = currentPage, len = currentPage + PAGE_NO_PER_GROUP;
         i < len && i <= pageGroup; i++) {
        let page = pageForm.cloneNode(true);
        addClickListener(page, lister, i - 1);
        page.getElementsByClassName('page-link')[0].innerText = i;
        paginationPosition.appendChild(page);
    }

    /** (만약 있을 경우,) '다음 페이지' 버튼 추가 */
    if (currentPage + PAGE_NO_PER_GROUP <= pageGroup) {
        addClickListener(nextForm, lister, currentPage + PAGE_NO_PER_GROUP - 1);
        paginationPosition.appendChild(nextForm);
    }
}

/**
 * @description 목록 항목들을 HTNL Table Row 형식으로 구성
 * (단, Response 의 Key 들이 Table Row 들의 ClassName 으로 포함되어있어야함.
 * 자세한 건 가이드라인 참고.)
 * @param {Object} respData - 목록에 표시할 응답 내용 (Object)
 * @param detailLink        - 클릭시 이동할 상세정보 링크 페이지
 * @param linkParamKey      - detailLink 에 붙일 Query Parameter 의 정보
 */
function composeList(respData, detailLink, linkParamKey) {
    let tablePosition = document.getElementById('table-content');
    let dataItemRowForm = document.getElementsByClassName('data-row')[0];
    let dataItemRow = dataItemRowForm.cloneNode(true);
    let dataItem = dataItemRow.getElementsByClassName('data-text');
    let listData = respData;

    /** (이전에 목록에 남아있는거 지우고) 목록을 채워넣음
     *  목록에 들어갈 항목을 추가하며, Click Event Listener도 추가해줌 */
    tablePosition.innerHTML = null;

    for (let i = 0, dataLen = listData.length; i < dataLen; i += 1) {
        let link = detailLink + listData[i][linkParamKey];
        addClickListener(dataItemRow, loadPage, link);

        for (let j = 0, colLen = dataItem.length; j < colLen; j += 1) {
            let key = implodeClassName(dataItem[j].className);

            if (listData[i][key] === undefined) {
                console.log('Undefined value in response @ index ' + i + ' with key \'' + key + '\'');
            } else {
                dataItem[j].innerText = listData[i][key];
            }
        }
        tablePosition.appendChild(dataItemRow);
        dataItemRow = dataItemRowForm.cloneNode(true);
        dataItem = dataItemRow.getElementsByClassName('data-text');
    }
}

/**
 * @description 페이지 내의 상세정보 입력란을 채우도록 함. data-* 형식의 ClassName과
 * Server Response의 Key로 되어있는 id 지정이 필요함
 * (자세한 예시는 가이드라인 참고.)
 * @param {Object} data - 상세정보를 담고 있는 Key-Value 형식의 Object
 */
function fillForm(data) {
    let inputDatas = document.getElementsByClassName('data-input');
    let optionDatas = document.getElementsByClassName('data-option');
    let textDatas = document.getElementsByClassName('data-text');
    let summernote = $('.summernote');

    const summernoteHeight =
        document.getElementsByClassName('single-card-view')[0].clientHeight
        - document.getElementsByTagName('form')[0].clientHeight - 100;
    const summernoteMaxHeight = 300;

    for (let i = 0, len = inputDatas.length; i < len; i += 1) {
        let key = inputDatas[i].id;

        if (data[key] === undefined) {
            console.log('Undefined value in response with key \'' + key + '\'');
        } else {
            inputDatas[i].value = data[key];
        }
    }

    for (let i = 0, len = optionDatas.length; i < len; i += 1) {
        let key = optionDatas[i].id;

        if (data[key] === undefined) {
            console.log('Undefined value in response with key \'' + key + '\'');
        } else {
            optionDatas[i].value = data[key];
        }
    }

    for (let i = 0, len = textDatas.length; i < len; i += 1) {
        let key = textDatas[i].id;

        if (data[key] === undefined) {
            console.log('Undefined value in response with key \'' + key + '\'');
        } else {
            textDatas[i].innerText = data[key];
        }
    }

    /** Summernote를 사용하기로 한 경우, 이를 따로 초기화해주는 것이 필요함 */
    summernote.summernote({height: summernoteHeight, maxHeight: summernoteMaxHeight});
    summernote.summernote('disable');
}

/** 조회모드에서 수정모드로 전환하도록 함 */
function unsetReadonly() {
    let options = document.getElementsByTagName('option');
    let inputs = document.getElementsByTagName('input');
    let texts = document.getElementsByTagName('textarea');
    let buttonView = document.getElementById('button-view');
    let buttonUpdate = document.getElementById('button-update');
    let summernote = $('.summernote');

    /** 조회는 각 태그들에 disabled 속성을 걸어 입력창에 접근 못하도록 한 것이며,
     *  수정모드 전환은 이 disabled 속성을 제외하는 것임 */
    for ( let i = 0, len = options.length; i < len; i += 1 ) {
        options[i].removeAttribute('disabled');
    }

    for (let i = 0, len = inputs.length; i < len; i += 1) {
        inputs[i].removeAttribute('disabled');
    }

    for (let i = 0, len = texts.length; i < len; i++) {
        texts[i].removeAttribute('disabled');
    }

    buttonView.style.display = 'none';
    buttonUpdate.style.display = 'block';
    summernote.summernote('enable');
}

/**
 * @description Version 2 서버에 Request 보내는 Logic 중 공통부분들을 모아놓은 Wrapper
 * @param Object data           - 서버에 전달할 Key-Value 형식의 Body
 * @param {function} callback       - 요청 성공시 수행할 Function
 */
function fetchData(path, data, callback) {
    // Cross-Origin Resource Sharing Policy로 인해서 동일 Origin에서 사용되어야
    let URL = 'http://985b087b.ngrok.io' + path;

    fetch(URL, {
        body: data.body,
        method: data.method,
        headers: data.headers,
        credentials: 'include'
    }).then(function (response) {
        if (response.status / 100 === 2) {
            response.json().then(function (data) {
                callback(data);
            });
        } else if (response.status === 401) {
            window.location= '/pages/login.html';
        }
    });
}

/**
 * @description {@link fillForm} 수행 중 ClassName 들에서 표시항목에 대한 Key 값을 추출함
 * @param {string} className    - Key 값이 들어있는 ClassName (ex. 'data-item name')
 * @returns {string}            - 추출한 Key 값 (ex. 'name')
 */
function implodeClassName(className) {
    return className.substring('data-item'.length + 1);
}

/**
 * @description Click Event 에 대한 Event Listener 를 할당하기 위한 Wrapper
 * @param {HTMLElement} element - Event Listener 를 할당할 DOM Object
 * @param {function} promise    - Click 이벤트 발생시 실행할 Function
 * @param {number|string|null} param - promise 실행에 필요한 인자 (보통 한 개)
 */
function addClickListener(element, promise, param = null) {
    element.addEventListener('click', function () {
        promise(param);
    })
}


/**
 * @description URL Query String 에서 특정 Key 값의 Value 를 가져옴
 * @param {String} name - 찾고싶은 Value 의 Key 값
 * @returns {String}    - 해당 Key 값의 Value
 */
function getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * @description Browser API 의 '이전 페이지' 이벤트를 호출
 * 보통 '목록' 버튼에 Event Listener 로 할당할 때 쓰임
 */
function goBack() {
    window.history.back();
}

/**
 * 해당 페이지에서 최대 몇 개의 목록 항목을 표시할 수 있는지 계산.
 * 각 View 가 스크롤 없이 하나의 카드만 띄우는 형식이라
 * 가용한 표시 영역을 계산하여 반환하는 것임
 * @returns {string}
 * @todo 화면 크기에 따라 Pagination의 갯수가 달라지니 각 목록에서 연번을 넣어주는 것이 필요함
 */
function getMaxLine() {
    return Math.floor((document.getElementsByClassName('card-body')[0].clientHeight
        - document.getElementsByClassName('card-title')[0].clientHeight)
        / (document.getElementsByTagName('thead')[0].clientHeight) - 3).toString();
}

/**
 * @description Toast 메세지를 띄움
 * @param {string} body - Toast 메세지에 표시할 내용
 */
function triggerToast(body) {
    let element = document.getElementById('toast');
    element.innerText = body;
    element.className = 'show';

    /** Toast 메세지를 2초 동안 띄움. 시간 조절시
     *  doubleh.main.css 에서 fadeIn fadeOut 속성도 같이 조절해줘야함 */
    setTimeout(function () {
        element.className = element.className.replace('show', '');
    }, 2000);
}


/**
 * @description 현재 페이지를 새로고침하는 Function (ex. 취소 확인창에서 "확인"버튼 누른 후)
 *
 * @param {string} modalID  - 완전히 사라지기를 기다릴 modal 의 id (# 제외하고)
 * @param {string} url      - 새로고침, 혹은 이동할 페이지 주소
 */
function loadPageAfterModal(modalID, url = null) {
    /** url 이 기본값(null)인 경우, 현재 페이지를 새로고침 */
    if (url === null) {
        url = window.location.hash.replace(/#/ig, '');
    }

    if (document.getElementsByClassName('modal-backdrop').length !== 0) {
        $('#' + modalID).on('hidden.bs.modal', function () {
            loadPage(url);
        });
    } else {
        loadPage(url);
    }
}

/**
 * @description Pagination 을 위한 전역 변수들
 * @var {number} currentPage                - 현재 페이지 번호를 저장
 * @var {number} pageGroup                  - 해당 기능에서 전체 페이지의 수
 * @constant {number} PAGE_NO_PER_GROUP     - 한 페이지당 표시할 목록의 갯수 (composeList 에서 사용됨)
 * @type {number}
 */
let currentPage = 0;
let pageGroup = 0;
const PAGE_NO_PER_GROUP = 5;

/**
 * @description Version 2 서버에 로그아웃 요청. 서버에 세션 종료를 명시적으로 알려줌
 * 로그아웃 성공시 로그인 페이지로 이동
 */
function performLogout() {
    let data = new FormData();
    data.append('func', 'signout_user');

    fetchData(data, function () {
        window.location.href = 'pages/login.html?redirect_url=' + '/';
    });
}

/**
 * @description 로그아웃 버튼에 대한 Event Listener를 할당함
 */
if(document.getElementById('button-logout') !== null)
    addClickListener(document.getElementById('button-logout'), performLogout, null);