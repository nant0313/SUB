var lines = {
    '1001': '1호선',
    '1002': '2호선',
    '1003': '3호선',
    '1004': '4호선',
    '1005': '5호선',
    '1006': '6호선',
    '1007': '7호선',
    '1008': '8호선',
    '1009': '9호선',
    '1063': '경의중앙선',
    '1065': '공항철도',
    '1067': '경춘선',
    '1071': '수인분당선',
    '1075': '분당선',
    '신분당선': '1077',
    '1호선': '1001',
    '2호선': '1002',
    '3호선': '1003',
    '4호선': '1004',
    '5호선': '1005',
    '6호선': '1006',
    '7호선': '1007',
    '8호선': '1008',
    '9호선': '1009',
    '경의중앙선': '1063',
    '공항철도': '1065',
    '경춘선': '1067',
    '수인분당선': '1071',
    '분당선': '1075',
    '신분당선': '1077'
};
window.onload = function () {
    init();
}
$('form').on('submit', () => {
    send();
})
function seperate(data, cb) {
    if ($.trim(data) == "") alert('값입력해');
    else {
        var tmp = data.split(' ');
        var name = tmp[1].replace('역', '');
        cb(lines[tmp[0]], name);
    }
}
function send() {
    var received = $('#stat').val();
    seperate(received, function (line, stat) {
        if ($.trim(line + stat) == "") { alert("값입력해"); return false; }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'NODEJS_SERVER_ADDRESS/sub?stat=' + encodeURIComponent(stat));
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        console.log('보냈습니다')
        xhr.onload = function () {
            var xml = xhr.response;
            console.log(xml)
            if ($(xml).find('total').text() == "0") return $('#after').html('<h1>모든 운행이 종료되었습니다.</h1>');
            var str = $(xml).find('row');
            var res = "";
            // 콜백함수 ㅜㅜㅜㅜ
            $(str).each(function (idx) {
                console.log(this);
                if ($(this).find('statnNm').text() == stat && $(this).find('subwayId').text() == line) {
                    var get = $(this).find('arvlMsg2').text();
                    var arvlCd = $(this).find('arvlCd').text();

                    res += '<h2>' + lines[$(this).find('subwayId').text()] + ' ' + $(this).find('bstatnNm').text() + '행 열차</h2><br>';

                    var open = get.indexOf(String.fromCharCode(40));
                    if (arvlCd == "0") {
                        res += stat + '역에 진입중입니다<br>';
                    }
                    else if (arvlCd == "1") {
                        res += stat + '역에 도착했습니다<br>';
                    }
                    else if (arvlCd == "2") {
                        res += stat + '역을 출발했습니다<br>';
                    }
                    else if (arvlCd == "3") {
                        res += '전역을 출발했습니다<br>';
                    }
                    else if (arvlCd == "4") {
                        res += '전역에 진입중입니다<br>';

                    }
                    else if (arvlCd == "5") {
                        res += '전역에 도착했습니다<br>';
                    } else if (get[0] == '[') { // 경의 중앙선
                        get = get.replace('[', '');
                        get = get.replace(']', '');
                        get = get.replace('역', '');
                        get = get.replace(String.fromCharCode(40), '');
                        get = get.replace(String.fromCharCode(41), '역');
                        console.log(get);
                        res += '현위치 : ' + get;
                    } else {

                        var date = new Date();
                        // 현 시간
                        var hh = parseInt(date.getHours());
                        var mm = parseInt(date.getMinutes());
                        var ss = parseInt(date.getSeconds());
                        var recptnDt = $(this).find('recptnDt').text();
                        var recp_time = recptnDt.substring(recptnDt.indexOf(' ') + 1, recptnDt.length - 2);
                        // 서버에서 정보 보낸 시간
                        var params = recp_time.split(':');
                        var params_hh = parseInt(params[0]);
                        var params_mm = parseInt(params[1]);
                        var params_ss = parseInt(params[2]);
                        console.log(params);
                        // 서버에서 받은 도착 정보
                        var serv_get, serv_mm, serv_ss;
                        if (get[get.length - 1] == get.indexOf(String.fromCharCode(40))) {
                            serv_get = get.substring(0, open - 3);
                            serv_mm = parseInt(serv_get.substring(0, serv_get.indexOf('분')));
                            serv_ss = parseInt(serv_get.substring(serv_get.indexOf(' ') + 1, serv_get.indexOf('초')));
                        } else {
                            serv_mm = parseInt(get.substring(0, get.indexOf('분')));
                            serv_ss = parseInt(get.substring(get.indexOf(' ') + 1, get.indexOf('초')));
                        }
                        // 시간 차
                        var cha_mm, cha_ss;
                        if (hh != params_hh) {
                            if (hh == 0) {// 되는지 확인

                            } else {
                                cha_mm = mm - params_mm + 60;
                                cha_ss = ss - params_ss;
                                if (cha_ss < 0) {
                                    cha_ss = ss - params_ss + 60;
                                    cha_mm--;
                                }
                            }
                        }
                        else if (mm > params_mm) {
                            if (ss > params_ss) {
                                cha_mm = mm - params_mm;
                                cha_ss = ss - params_ss;
                            } else {
                                cha_mm = mm - params_mm - 1;
                                cha_ss = ss - params_ss + 60;
                            }
                        } else {
                            cha_mm = 0;
                            cha_ss = ss - params_ss;
                        }
                        var cha_mm = mm - params_mm;
                        var cha_ss = ss - params_ss;
                        // 합치기
                        serv_mm -= cha_mm;
                        serv_ss -= cha_ss;
                        if (serv_ss < 0) {
                            serv_ss += 60;
                            serv_mm--;
                        }
                        // 분 초 보정
                        if (serv_ss >= 60) {
                            serv_mm++;
                            serv_ss -= 60;
                        }
                        // 출력
                        var close = get.lastIndexOf(String.fromCharCode(41));
                        if (close == "-1")
                            res += '현위치 : ' + $(this).find('arvlMsg3').text() + '<br>';
                        else
                            res += '현위치 : ' + get.substring(open + 1, close) + '<br>';
                        res += serv_mm + '분 ' + serv_ss + '초' + ' 후 ' + stat + '역에 도착합니다<br>';
                    }

                    $('#after').html(res);
                }
            });
        }
        xhr.send();
    })
}
function init() {
    $.ajax({
        type: "get",
        dataType: "xml",
        url: "./sub_info.xml",
        success: function (xml) {
            var str = $(xml).find('text');
            $(str).each(function (idx) {
                var ret = lines[$(this).find('sub_id').text()] + ' ' + $(this).find('stat_name').text() + '역';
                $('#search').append('<option value="' + ret + '">');
            });
        }
    });
}
