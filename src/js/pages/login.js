/**
 * @description 로그인을 수행
 * @param {{userid: *, access_code: *}} data    ID, 비밀번호를 포함한 Object
 */
function performLogin(data) {
    let URL = '';

    /** 해당 주소로 로그인 수행 */
    fetch(URL,{
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        method: 'POST',
        credentials: 'include'
    }).then(function (response) {
        response.json().then(function (data) {
            // TODO Backend에서 성공/실패 여부 확인할 수 있도록 형식 바꾸기
            if(data != null) {
                // Main Page로 Redirection
                window.location = getParameterByName('redirect_url');
            } else {
                // TODO #login-message에 틀린 횟수 나타내기
            }
        });
    })
}

/**
 * @description URL Query String에서 특정 Key값의 Value를 가져옴
 * doubleh.main에 이미 정의되어 있으나,
 * login.html은 login.js만을 사용해서 따로 정의했음
 * @param {String} name
 * @returns {String}
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
 * @description 로그인 페이지 로딩 후 필요 설정들 수행
 */
function initLogin() {
    /**
     * 로그인 버튼 클릭시 필요 정보들 (ID, PW)를 가져오고 {@link performLogin}을 수행함
     * @returns {boolean} (Auto-generated)
     */
    function loginAction() {
        let userid = document.getElementById('userid').value;
        let access_code = document.getElementById('access-token').value;

        if (userid === '' || access_code === '') {
            document.getElementById('login-message').innerText = '아이디와 비밀번호를 입력해주세요';
            return false;
        }

        let data = {
            'userid': userid,
            'access_code': access_code
        };
        performLogin(data);
    }

    let loginButton = document.getElementById('login');
    let passwordField = document.getElementById('access-token');

    /** 로그인 버튼에 클릭 Event Listener 할당, Enter 키로도 가능하게 설정 */
    loginButton.addEventListener('click', loginAction, false);
    passwordField.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            document.getElementById('login').click();
        }
    });
}

initLogin();