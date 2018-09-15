/**
 * @file 회원정보 상세 페이지에(views/member/detail.html) 대한 Script 정의
 */


/** @description 사용자의 벨트(혹은 기기) 사용정보를 서버에 요청
 * Version 2 서버에서는 get_beltlog 서비스를 사용
 */
function getBeltUsageLog() {

    fetchData('/api/bus/2', {method: 'GET'}, function (respData) {
        let keys = ['seatNum', 'seated', 'buckled'];

        if (respData === undefined) {
            return false;
        }
        else {
            for (let i=0; i<32; i++) {
                if (respData['seats'][i][keys[1]]==true && respData['seats'][i][keys[2]]==true){
                    lightOnGreen(i+1);
                } else if(respData['seats'][i][keys[1]]==true && respData['seats'][i][keys[2]]==false){
                    lightOnRed(i+1);
                }
            }
        }
    })
}

function getSpecifiedBusList() {

    fetchData('/api/bus/2', {method: 'GET'}, function (respData) {
        let keys = ['busNum', 'name', 'rate'];

        if (respData['meta'].length !== 0) {
            let position = document.getElementById('table-content2');
            position.innerHTML = null;
            let row = document.createElement('tr');

            for (let j = 0, colLen = keys.length; j < colLen; j++) {
                let col = document.createElement('td');
                col.innerText = respData['meta'][keys[j]];
                row.appendChild(col);
            }

            position.appendChild(row);
        }
    })
}


/** @description 회원정보 조회 페이지 로딩 후 필요한 설정들 진행
 */
function initMemberInfo() {
//    getMemberInfo();
//    getLDILog();
//    getMemberParingLog();
    getBeltUsageLog();
    getSpecifiedBusList();
}   

initMemberInfo();

function lightOnRed(val) {
    window.document.getElementById('seat_'+val).style.backgroundColor = "red";
    window.document.getElementById('seat_'+val).style.color = "white";

}

function lightOnGreen(val) {
    window.document.getElementById('seat_'+val).style.backgroundColor = "green";
    window.document.getElementById('seat_'+val).style.color = "white";

}