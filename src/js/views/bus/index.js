/**
 * @file 사용자 목록 페이지(views/member/index.html)에 대한 Script 정의
 */

/**
 * @description 회원 목록을 서버에 요청 후 페이지에 표지
 * @param page 목록에 표시할 페이지. 0부터 시작함
 *             예를 들어, 화면의 1페이지는 0으로 들어감 (Version 2 서버의 페이지 계산법 때문)
 */
function getBusList() {

    fetchData('/api/bus', {method: 'GET'}, function (respData) {
        let keys = ['busIndex', 'busNum', 'name', 'rate'];
        let url='bus/bus_detail.html?id=';

        if (respData['buses'].length !== 0) {
            let position = document.getElementById('table-content');
            position.innerHTML = null;

            for (let i = 0, rowlen = respData['buses'].length; i < rowlen; i++) {
                let row = window.document.createElement('tr');

                for (let j = 0, colLen = keys.length; j < colLen; j++) {
                    let col = document.createElement('td');
                    col.innerText = respData['buses'][i][keys[j]];
                    row.appendChild(col);
                }
                addClickListener(row, loadPage, url+respData['buses'][i]['busIndex']);

                position.appendChild(row);
            }
        }
    })
}

function sendBusList() {
    let list = document.forms['onGoingBus'];
    var bus_num = list.getElementsByClassName('data-text busIndex')[0];
}

function post_to_url(path, params, method, enctype) {

}

/**
 * @description 회원 목록 페이지 로딩 후 필요한 설정 진행
 */
function initMemberList() {
    // setTimeout(getBusList, 1000);
    getBusList();
}

initMemberList();
