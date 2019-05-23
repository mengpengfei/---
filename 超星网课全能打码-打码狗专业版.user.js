// ==UserScript==
// @name         超星网课全能打码-打码狗专业版
// @namespace    Anubis Ja
// @version      3.0.0
// @description  支持页面：[为保障您的账号安全，请输入验证码]，[您的操作异常，请输入验证码]，[课后习题提交频繁]，[进入考试] 必须配合【超星网课助手】使用 https://greasyfork.org/zh-CN/scripts/369625
// @author       Anubis Ja
// @match        *://*.chaoxing.com/mycourse/studentstudy*
// @match        *://*.chaoxing.com/exam/test?*
// @match        *://*.chaoxing.com/antispiderShowVerify.ac*
// @match        *://*.chaoxing.com/html/processVerify.ac?ucode*
// @match        *://*.edu.cn/mycourse/studentstudy*
// @match        *://*.edu.cn/exam/test?*
// @match        *://*.edu.cn/antispiderShowVerify.ac*
// @match        *://*.edu.cn/html/processVerify.ac?ucode*
// @require      https://cdn.staticfile.org/jquery/1.7.2/jquery.min.js
// @connect      damagou.top
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @supportURL   https://greasyfork.org/zh-CN/scripts/380572/feedback
// ==/UserScript==

// 以下代码均不需要修改
var _self = unsafeWindow,
$ = _self.jQuery || window.jQuery,
setting = {
    'uselist': '0',
    'userkey': '',
    'timeout': '8000',
    'retry': '3',
    'rate': '3000'
};

Number.prototype.format = function() {
    return this > 10 ? this : '0' + this;
}

$.each(setting, function(key, value) {
    setting[key] = GM_getValue(key, value);
});

var $div = $(
    '<div style="border: 2px dashed rgb(0, 85, 68); width: 300px; position: fixed; top: 30px; left: 1%; z-index: 999999; font-size: 15px; background-color: rgba(70, 196, 38, 0.8); color: white;">' +
        '<div style="text-align: center; color: black; font-size: 20px;">超星网课全能打码-打码狗专业版</div>' +
        '<hr>' +
        '<div style="margin: 0 5px; font-size: 15px;"></div>' +
        '<hr>' +
        '<form style="margin: 0 5px;">' +
            '<div style="text-align: center; color: red;">本区域参数修改后自动保存</div>' +
            '<div>' +
                '<label for="damagou">接口：</label>' +
                '<input id="damagou" name="uselist" type="radio" value="0">' +
                '<label for="damagou"> damagou</label>' +
            '</div>' +
            '<div>' +
                '<label for="userkey">key：</label>' +
                '<input id="userkey" name="userkey" placeholder="请输入有效的key">' +
            '</div>' +
            '<div>' +
                '<label for="timeout">打码超时：</label>' +
                '<input id="timeout" name="timeout" type="number" min="8000" style="width: 55px; text-align: center;">' +
                '<label for="timeout" style="margin-right: 15px;"> 毫秒</label>' +
                '<label for="retry">重试：</label>' +
                '<input id="retry" name="retry" type="number" style="width: 35px; text-align: center;">' +
                '<label for="retry"> 次</label>' +
            '</div>' +
            '<div>' +
                '<label for="rate">打码频率：</label>' +
                '<input id="rate" name="rate" type="number" min="3000"  style="width: 55px; text-align: center;">' +
                '<label for="rate" style="margin-right: 15px;"> 毫秒/次</label>' +
                '<button name="clean" type="button">清空日志</button>' +
            '</div>' +
        '</form>' +
        '<hr>' +
        '<div style="margin-left: 5px; max-height: 500px; overflow-y: auto;"></div>' +
    '</div>'
).appendTo('body').on('input change', 'input', function(event) {
    var name = $(this).attr('name');
    GM_setValue(name, this.value);
    setting[name] = this.value;
    if (event.type == 'change') msg('配置保存成功，即时生效', 'black');
}).on('click', 'button', function(event) {
    // var name = $(this).attr('name');
    // if (name != 'clean') return;
    $div.children('div:last').html('');
}).find('input').each(function() {
    var type = $(this).attr('type'),
    name = $(this).attr('name');
    if (type == 'radio') {
        this.checked = setting[name] == this.value;
    } else {
        this.value = setting[name];
    }
}).end();


// 为保障您的账号安全，请输入验证码
$('[name=chapterNumVerCode]').load(function() {
    if (!$('#chapterVerificationCode:visible').length) return;
    $('#identifyCodeRandom').val('').attr('placeholder', '正在打码中');
    msg('为保障您的账号安全', 'black');
    beforeGet(this, 1);
});
// 您的操作异常，请输入验证码
$('#ccc').load(function() {
    $('#identifyCodeRandom').val('').attr('placeholder', '正在打码中');
    msg('您的操作异常，请输入验证码', 'black');
    beforeGet(this, 2);
});
// 课后习题提交频繁验证码
$('#imgVerCode').load(function() {
    if (!$('#validate:visible').length) return;
    $('#code').val('').attr('placeholder', '正在打码中');
    msg('课后习题提交频繁', 'black');
    beforeGet(this, 3);
});
// 考试，重考
$('[name=examNumVerCode]').load(function() {
    if ($(this).is(':hidden')) return;
    $(this).prev().val('').attr('placeholder', '正在打码中');
    msg('进入考试', 'black');
    beforeGet(this, 4);
});

function beforeGet(dom, page) {
    var img = new Image();
    img.src = $(dom).attr('src');
    img = imageBase64(img);
    // console.log(img);
    setting.count = setting.error = 1;
    setting.tip = setInterval(getCode, setting.rate, page, img);
}

function getCode(page, img) {
    if (setting.uselist == 0) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://www.damagou.top/apiv1/recognize.html',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            timeout: setting.timeout,
            data: 'image=' + encodeURIComponent(img) + '&userkey=' + setting.userkey+'isJson=2',
            onload: function(xhr) {
                if (xhr.status != 200) return;
                var obj = $.parseJSON(xhr.responseText);
                // console.log(obj);
                if (obj.status != '0') {
                    msg('damagou打码错误：' + obj.msg, 'red');
                    if (++setting.count > setting.retry) {
                        clearInterval(setting.tip);
                        msg('damagou打码：重试次数上限', 'red');
                    } else {
                        msg('damagou打码重试', 'red');
                    }
                } else if (++setting.error <= setting.retry) {
                    clearInterval(setting.tip);
                    msg('damagou打码：' + obj.data + ' ' + obj.msg, 'black');
                    dama(page, obj.data);
                } else {
                     clearInterval(setting.tip);
                     msg('damagou打码：重试次数上限', 'red');
                }
            },
            ontimeout: function() {
                if (++setting.count > setting.retry) {
                    clearInterval(setting.tip);
                    msg('damagou打码：超时重试次数上限', 'red');
                } else {
                    msg('damagou打码：连接超时重试', 'red');
                }
            },
            onerror: function() {
                clearInterval(setting.tip);
                msg('damagou打码：服务器错误', 'red');
            }
        });
    }
}

function dama(page, result) {
    clearInterval(setting.tip);
    if (page == 1) {
        $('#identifyCodeRandom').val(result);
        _self.continueGetTeacherAjax();
        setInterval(check1, 2E3);
    } else if (page == 2) {
        if (result.length != 4) location.reload();
        $('#ucode').val(result);
        $('.submit').click();
    } else if (page == 3) {
        $('#code').val(result);
        $('#sub:visible')[0].click();
    } else if (page == 4) {
        $('[id$=identifyCodeRandom]:visible').val(result);
        $('[id$=startTestDiv] > a:visible')[0].click();
        setTimeout(check4, 2E3);
    }
}

function check1() {
    if ($('#chapterVerificationCodeTip:hidden').length) return;
    _self.WAY.box.hide();
    $('#chapterVerificationCodeTip').hide();
    _self.showChapterVerificationCode();
}

function check4() {
    $('[id$=tipIdentifyCode]:visible').next().find('a')[0].click();
    $('[name=examNumVerCode]:visible').click();
}

function imageBase64(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canvas.toDataURL('image/png').substr(22);
}

function msg(msg, color) {
    var d = new Date(),
    t = d.getHours().format() + ':' + d.getMinutes().format() + ':' + d.getSeconds().format();
    msg = t + '  ' + msg;
    $div.children('div:last').append('<p style="color: ' + color + '">' + msg + '</p>');
}

if (setting.userkey) {
    msg('脚本正在运行', 'black');
} else {
    msg('打码key不能为空', 'red');
}
