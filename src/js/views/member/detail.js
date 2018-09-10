/**
 * @file 회원정보 상세 페이지에(views/member/detail.html) 대한 Script 정의
 */

/** @description
 * 회원정보를 서버에 요청하여 페이지에 표시
 * Version 2 서버의 'get_user' 서비스를 사용
 */
function getMemberInfo() {
    let data = new FormData();
    data.append('func', 'get_user');
    data.append('userid', getParameterByName('userid'));

    fetchData(data, function (respData) {
        /** fillForm 으로 간단하게 페이지에 정보 합성 */
        fillForm(respData);
    });
}

/** @description
 * 회원정보 수정을 서버에 요청
 * Version 2 서버의 'set_user' 서비스를 사용
 */
function updateMemberInfo() {
    let textData = document.getElementsByClassName('data-input');
    let optionsData = document.getElementsByClassName('data-option');
    let data = new FormData();

    data.append('func', 'set_user');
    /** @todo [180510] 현재 서버는 userid를 변경할 ID로 받고, 현재 사용자는 세션으로 구분
     *  @todo 따라서 이에 대한 Mechanism을 다시 생각해봐야함 (ID 변경하도록 놔둘 것인가?)
     *  @todo [180528] Key Constraint에 걸림 */
    data.append('userid', getParameterByName('userid'));

    for (let i = 0, len = optionsData.length; i < len; i++) {
        data.append(optionsData[i].id, optionsData[i].value)
    }

    for (let i = 0, len = textData.length; i < len; i++) {
        data.append(textData[i].id, textData[i].value)
    }

    /** 요청 결과를 Toast 메세지로 표시 */
    fetchData(data, function (respData) {
        if (respData === 1) {
            triggerToast('정상적으로 수정되었습니다.');
        } else if (respData === 0) {
            triggerToast('수정된 사항이 없습니다.');
        }
    });
}

/** @description
 * 임시 비밀번호 발송을 서버에 요청
 * Version 2 서버의 'reset_passwd' 서비스를 사용
 */
function resetPassword() {
    let data = new FormData();
    let email = document.getElementById('email').value;

    data.append('func', 'reset_passwd');
    data.append('email', email);

    /** 서버 요청 결과를 Toast 메세지로 표시 */
    fetchData(data, function () {
        triggerToast('임시 비밀번호가 변경되었습니다.');

    });
}

/**
 * @description 사용자의 LDI 측정 정보를 서버에 요청
 * Version 2 서버의 'get_health' 서비스를 사용
 */
function getLDILog() {
    let data = new FormData();
    data.append('func', 'get_health');
    data.append('userid', getParameterByName('userid'));
    data.append('attr', 'LDI');

    /** 요청 성공시 #modal-ldi-log 에 표시함 */
    fetchData(data, function (respData) {
        let keys = ['logged', 'measure'];

        if (respData.length !== 0) {
            let position = document.getElementById('modal-ldi-log')
                .getElementsByTagName('tbody')[0];
            position.innerHTML = null;

            for (let i = 0, rowlen = respData.length; i < rowlen; i++) {
                let row = document.createElement('tr');

                for (let j = 0, colLen = keys.length; j < colLen; j++) {
                    let col = document.createElement('td');
                    col.innerText = respData[i][keys[j]];
                    col.setAttribute('class', 'text-center');
                    row.appendChild(col);
                }

                position.appendChild(row);
            }
        }
    });
}

/** @description 사용자의 기기-스마트폰 간의 페어링 기록을 가져옴
 * (고객문의와 달리, 모든 기기 종류를 가져옴)
 * @param {number} page - 확인할 페어링 로그의 페이지 번호
 */
function getMemberParingLog(page = 0) {
    let data = new FormData();

    data.append('func', 'get_pairing_log');
    data.append('userid', getParameterByName('userid'));
    data.append('page', page.toString());

    fetchData(data, function (respData) {
        let keys = ['date', 'device-model', 'device-version', 'device-os', 'eqmt-id', 'eqmt-firmware'];

        if (respData.length !== 0) {
            let position = document.getElementById('modal-pairing-log')
                .getElementsByTagName('tbody')[0];
            position.innerHTML = null;

            for (let i = 0, rowlen = respData.length; i < rowlen; i++) {
                let row = document.createElement('tr');

                for (let j = 0, colLen = keys.length; j < colLen; j++) {
                    let col = document.createElement('td');
                    col.innerText = respData[i][keys[j]];
                    col.setAttribute('class', 'text-center');
                    row.appendChild(col);
                }

                position.appendChild(row);
            }
        }
    });
}

/** @description 사용자의 벨트(혹은 기기) 사용정보를 서버에 요청
 * Version 2 서버에서는 get_beltlog 서비스를 사용
 */
function getBeltUsageLog() {
    let data = new FormData();
    data.append('func', 'get_beltlog');
    data.append('userid', getParameterByName('userid'));

    fetchData(data,function (respData) {
        let keys = ['started', 'eqmtid', 'minutes', 'status'];
        let position = document.getElementById('modal-equipment-log')
            .getElementsByTagName('tbody')[0];
        position.innerHTML = null;

        if (respData === null) {
            return false;
        }
        else if (respData.length !== undefined) {
            for (let i = 0, rowlen = respData.length; i < rowlen; i++) {
                let row = document.createElement('tr');

                for (let j = 0, colLen = keys.length; j < colLen; j++) {
                    let col = document.createElement('td');
                    col.innerText = respData[i][keys[j]];
                    col.setAttribute('class', 'text-center');
                    row.appendChild(col);
                }

                position.appendChild(row);
            }
        } else {
            let row = document.createElement('tr');

            for (let j = 0, colLen = keys.length; j < colLen; j++) {
                let col = document.createElement('td');
                col.innerText = respData[keys[j]];
                col.setAttribute('class', 'text-center');
                row.appendChild(col);
            }

            position.appendChild(row);
        }
    })
}

/** @description 회원정보 조회 페이지 로딩 후 필요한 설정들 진행
 */
function initMemberInfo() {
    getMemberInfo();
    getLDILog();
    getMemberParingLog();
    getBeltUsageLog();

    /** '수정', ('수정 확인' Modal 창의) '예', ('취소 확인' Modal 창의) '예',
     *  ('임시 비밀번호 발송 확인' Modal 창의) '예', '목록' 버튼에 대한 Event Listener 할당
     *  @todo 삭제에 대한 Event Listener 할당 필요*/
    addClickListener(document.getElementById('update'), unsetReadonly, null);
    addClickListener(document.getElementById('button-confirm-update'), updateMemberInfo, null);
    addClickListener(document.getElementById('button-confirm-abort'), loadPageAfterModal, 'modal-abort');
    addClickListener(document.getElementById('button-confirm-password-reset'), resetPassword, null);
    addClickListener(document.getElementById('back'), goBack, null);
}

initMemberInfo();