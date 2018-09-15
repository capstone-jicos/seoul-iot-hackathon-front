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
                    asyncCall(i+1);                    
                }
            }
        }
    })
}

function initMemberInfo() {
    getBeltUsageLog();
}   

initMemberInfo();


function lightOnRed(val) {
    setInterval(function(){
    window.document.getElementById('seat_'+val).style.backgroundColor = "red";
    window.document.getElementById('seat_'+val).style.color = "white";
    },500);
    setInterval(function(){
    window.document.getElementById('seat_'+val).style.backgroundColor = "";
    window.document.getElementById('seat_'+val).style.color = "";
    },1000);

}
async function asyncCall(val){
    var result = await lightOnRed(val);
}

function lightOnGreen(val) {
    window.document.getElementById('seat_'+val).style.backgroundColor = "green";
    window.document.getElementById('seat_'+val).style.color = "white";
}