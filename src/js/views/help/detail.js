/**
 * @file 고객문의 상세조회 페이지(views/help/detail.html)에 대한 Script 정의
 */

/**
 * @description 고객이 첨부한 첨부파일을 다운로드 받을 수 있도록 링크
 * (사실상 Event Listener)를 생성해 페이지에 표시
 * @param {Array} attachments - 첨부파일들에 대한 정보
 */
function setAttachmentLink(attachments) {
    /** HTMLElement로 합성한 첨부파일 정보를 넣은 위치 */
    let position = document.getElementById('attachments');

    /** 첨부파일 정보들을 <div>와 <a>에 합성 후 position에 삽입
     *  @var {{sequence: Int, docname: String, id: String, sizeof: Int}} attachments[i] */
    for (let i = 0, len = attachments.length; i < len; i++) {
        let attachment = document.createElement('div');
        let targetString = '{0} ({1})';
        let link = document.createElement('a');

        link.setAttribute('href', '#');
        targetString = targetString.replace('{0}', attachments[i]['docname']);
        targetString = targetString.replace('{1}', formatFileSize(attachments[i]['sizeof']));
        link.innerText = targetString;
        attachment.appendChild(link);

        addClickListener(link, downloadAttachment, attachments[i]['id']);
        position.appendChild(attachment);
    }
}

/**
 * Byte 단위의 파일 사이즈를 알맞은 용량 단위로 Format
 * @param {number} size - Byte 단위의 첨부파일 크기
 * @returns {string}    - 알맞은 용량 단위로 Format한 표시값 (ex. 24MB)
 */
function formatFileSize(size) {
    let unit = ['Byte', 'KB', 'MB', 'GB'];
    let index = 0;

    while (size > 1024 && index < 3) {
        size /= 1024;
        index++;
    }

    return Number.parseFloat(size).toPrecision(3) + unit[index];
}


/**
 * @description 고객문의 정보를 서버에 요청
 * Version 2 서버에서 get_casecall 서비스를 사용
 */
function getCasecall() {
    let data = new FormData();
    data.append('func', 'get_casecall');
    data.append('callid', getParameterByName('callid'));

    /** */
    fetchData(data, function (respData) {
        const data = respData[0];
        fillForm(data);

        if (data['attachment'] !== null) {
            setAttachmentLink(data['attachment']);
        }

        getPairingLog();                // 페어링 정보 가져옴
        getEquipmentLog();              // 기기 사용 정보 가져옴
    });
}

/**
 * @description 첨부파일을 다운로드 받도록 서버에 요청
 * Version 2 서버의 'download_file' 서비스를 사용
 * (HTML <form id='download'>에 정의 되어있음
 * @param id - 다운로드 받을 파일의 고유 ID
 */
function downloadAttachment(id) {
    let form = document.forms['download'];

    form.action = 'http://bend.pubple.com/w00/w00-s00.php';
    form['id'].value = id;
    form.submit();
}

/**
 * @description '담당자'와 '문의유형' Dropdown 항목의 선택지를 서버에 요청에 페이지에 표시
 * (바뀌게 되면 백엔드-DB-에서 바꾸면 되니까)
 */
function getCasecallOptionList() {
    let data = new FormData();
    data.append('func', 'get_options_list');

    /** 서버에 요청 후, HTMLElement로 합성하여 페이지에 표시 */
    fetchData(data, function (respData) {
        /** '담당자' 선택지와 '문의 유형' 선택지를 넣을 위치 */
        let assigneePosition = document.getElementById('assignee');
        let casetypePosition = document.getElementById('casetype');
        let setCcPosition = document.getElementById('modal-set-cc').getElementsByClassName('modal-body')[0];

        let setCcRowForm = document.getElementById('set-cc-row-form');
        let setCcColForm = document.getElementById('set-cc-col-form');

        let keys = Object.keys(respData['assignee']);
        for (let i = 0, len = keys.length; i < len; i++) {
            let optionElement = document.createElement('option');
            let setCcRow = setCcRowForm.cloneNode(false);
            let setCcCol = setCcColForm.cloneNode(false);
            let departmentElement = document.createElement('h6');

            // Dropdown에 먼저 추가
            optionElement.innerText = keys[i];
            optionElement.setAttribute('disabled', '');
            assigneePosition.appendChild(optionElement);

            // 관계자 선택 Modal에 Department 추가
            // TODO 벡엔드에서 하이픈 빼기
            departmentElement.innerText = keys[i].replace(/-*/g,'');
            setCcCol.appendChild(departmentElement);
            setCcRow.appendChild(setCcCol);
            setCcRow.removeAttribute('id');
            setCcPosition.appendChild(setCcRow);

            for (let j = 0, innerLen = respData['assignee'][keys[i]].length; j < innerLen; j++) {
                const name = respData['assignee'][keys[i]][j].name;
                const userid = respData['assignee'][keys[i]][j].userid;

                let setCcColInput = null;
                let setCcColLabel = null;

                // 담당자 Dropdown에 처리
                optionElement = document.createElement('option');
                optionElement.innerText = name;
                optionElement.value = userid;
                assigneePosition.appendChild(optionElement);

                // 참조메일 발송란 처리
                if (j % 4 === 0) {
                    setCcRow = setCcRowForm.cloneNode(false);
                    setCcRow.removeAttribute('id');
                    setCcPosition.appendChild(setCcRow);
                }
                setCcCol = setCcColForm.cloneNode(true);

                setCcColInput = setCcCol.getElementsByTagName('input')[0];
                setCcColInput.setAttribute('id', 'set-cc-' + userid);
                setCcColInput.setAttribute('value', userid);
                setCcColInput.setAttribute('class', 'set-cc-option');

                setCcColLabel = setCcCol.getElementsByTagName('label')[0];
                // userid는 너무 명시적임. 이걸 대안할 수 있는 다른 표현법 없을까?
                setCcColLabel.setAttribute('for', 'set-cc-' + userid);
                setCcColLabel.innerText = name;

                setCcCol.removeAttribute('id');
                setCcRow.appendChild(setCcCol);
            }
        }

        for (let i = 0, len = respData['casetype'].length; i < len; i++) {
            let optionElement = document.createElement('option');
            optionElement.value = respData['casetype'][i]['code'];
            optionElement.innerText = respData['casetype'][i]['name'];
            casetypePosition.append(optionElement);
        }
    });
}

/**
 * @description 해당 문의에 기존에 등록되어있던 답변을 서버에서 가져옴
 * Version 2 서버의 get_response 서비스를 사용
 */
function getResponse() {
    let data = new FormData();
    data.append('func', 'get_response');
    data.append('callid', getParameterByName('callid'));

    /** 서버에 Request 전송. 성공시 '문의 답변' Modal 창의 TextArea에 설정 */
    fetchData(data, function (respData) {
        document.getElementById('response').value = respData[0]['response'];
    })
}

/**
 * 해당 문의에 답변을 등록하기 위해 서버에 요청
 * Version 2 서버의 set_response 서비스를 사용
 */
function setResponse() {
    let data = new FormData();
    let response=document.getElementById('response').value;

    data.append('func', 'set_response');
    data.append('callid', getParameterByName('callid'));
    data.append('response', response);

    fetchData(data, function () {
        triggerToast('답변이 등록되었습니다.');
    });
}

/**
 * @description 해당 문의에 대한 정보(담당자, 진행상황, 문의 유형)를 서버에 변경 요청
 * Version 2 서버의 'set_caselog' 서비스를 사용
 */
function setCasecall() {
    let data = new FormData();
    let assignee = document.getElementById('assignee').value;
    let resolved_state = document.getElementById('resolved_state').value;
    let casetype = document.getElementById('casetype').value;

    data.append('func', 'set_caselog');
    data.append('callid', getParameterByName('callid'));
    data.append('assignee', assignee);
    data.append('resolved_state', resolved_state);
    data.append('casetype', casetype);

    /** 서버에 Request 전송. 성공시 Toast 메세지로 알림 */
    fetchData(data, function () {
        triggerToast('처리내역이 등록되었습니다.');
    });

}

/**
 * @description (사내 Communication용) 처리내역 등록을 서버에 요청
 * Version 2 서버의 'set_caselog' 서비스를 사용
 * @todo caselog만 설정하면 진행상태가 신규로 바뀜. 근데 처리여부는 계속 해결이네?? 문의유형은 그대로, 담당자로 그대로. 백엔드 코드를 봐야겠다.
 */
function setCaselog() {
    let data = new FormData();
    let memo = document.getElementById('caselog_input')
        .getElementsByClassName('data-input')[0].value;

    data.append('func', 'set_caselog');
    data.append('callid', getParameterByName('callid'));
    data.append('memo', memo);

    /** 요청 성공시, Toast 메세지로 결과를 보여주고 현재 페이지 새로고침 */
    fetchData(data, function () {
        triggerToast('처리내역이 등록되었습니다.');
        loadPageAfterModal('modal-set-caselog');
    });
}

/**
 * @description 해당 문의에 대해서 기존에 등록되어 있는 정보들
 * (문의유형, 담당자, 처리내역)을 서버에 요청 후 페이지에 표시
 * Version 2 서버의 'get_caselog' 서비스를 사용
*/
function getCaselog() {
    let data = new FormData();
    data.append('func', 'get_caselog');
    data.append('callid', getParameterByName('callid'));

    fetchData(data, function (respData) {
        let caselogForm = document.getElementById('caselog-card-form');
        let caselogPoistion = document.getElementById('caselog')
            .getElementsByClassName('card-list')[0];
        caselogPoistion.innerHTML = null;

        for (let i = 0, len = respData.length; i < len; i++) {
            let caselog = caselogForm.cloneNode(true);
            let logContent = caselog.getElementsByClassName('card-text')[0];
            let logInfo = caselog.getElementsByClassName('card-subtitle');

            logContent.innerText = respData[i]['memo'].replace(/^\n/g, '');
            logInfo[0].innerText = respData[i]['writer'];
            logInfo[1].innerText = respData[i]['recorded'];

            caselogPoistion.appendChild(caselog);
        }
    });
}

/**
 * @description 정확한 고객문의 진단을 위해서 해당 고객의 최근 휴대폰-기기 간
 * 페어링 기록 30건을 서버에 요청해 '페어링 정보 확인' Modal 창에 표시
 * Version 2 서버의 'cs_app_usage' 서비스를 사용
 * @todo eqmtid 도 실어서 보내야함
 * (Version 2 클라이언트 앱에서는 고객문의 등록 시 문제되는 기기 ID를 같이 보낸다는 가정하에)
 */
function getPairingLog() {
    let data = new FormData();
    let keys = ['date', 'device-model', 'device-version', 'device-os', 'eqmt-id', 'eqmt-firmware'];
    let userid = document.getElementById('userid').value;

    data.append('func', 'cs_app_usage');
    data.append('userid', userid);

    fetchData(data, function (respData) {
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

/**
 * @description 정확한 고객문의 진단을 위해 해당 고객의 기기 사용내역
 * 최근 30건을 서버에 요청해 '기기 사용 정보 확인' Modal 창에 표시
 * Version 2 서버의 'cs_beltlog' 서비스를 사용
 */
function getEquipmentLog() {
    let data = new FormData();
    let keys = ['started', 'minutes', 'vibrate', 'interrupted'];
    let userid = document.getElementById('userid').value;
    let eqmtid = document.getElementById('eqmtid').value;

    data.append('func', 'cs_beltlog');
    data.append('userid', userid);
    data.append('eqmtid', eqmtid);

    fetchData(data, function (respData) {
        if (respData.length !== 0) {
            let position = document.getElementById('modal-equipment-log')
                .getElementsByTagName('tbody')[0];
            position.innerHTML = null;

            for (let i = 0, rowLen = respData.length; i < rowLen; i++) {
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

/**
 * @description 고객문의 상세 조회 페이지 로딩 후 필요한 설정들 진행
 * @todo 담당자 설정 부분은 백엔드에서 수정이 필요
 */
function initCasecallDetail() {
    getCasecallOptionList();
    getCasecall();
    getResponse();
    getCaselog();


    addClickListener(document.getElementById('button-confirm-update'), setCasecall, null);
    addClickListener(document.getElementById('button-submit-response'), toggleModal, 'modal-confirm-response');
    addClickListener(document.getElementById('button-set-cc'), toggleModal, 'modal-confirm-set-cc');
    addClickListener(document.getElementById('button-confirm-response'), setResponse, null);
    // addClickListener(document.getElementById('button-confirm-set-cc'), null, null);
    addClickListener(document.getElementById('button-confirm-set-caselog'), setCaselog, null);
    addClickListener(document.getElementById('eqmtid').parentElement, toggleModal, 'modal-equipment-log');
    addClickListener(document.getElementById('appver').parentElement, toggleModal, 'modal-pairing-log');
    addClickListener(document.getElementById('back'), goBack, null);
}

initCasecallDetail();