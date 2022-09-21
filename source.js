// ==UserScript==
// @name         网页便利店
// @namespace    https://github.com/maxsky/WebPage-CVS
// @version      0.4.2
// @description  一些网页上的简单处理，使其更适合浏览
// @author       Max Sky
// @match        *://*.blog.csdn.net/article/details/*
// @match        *://blog.csdn.net/*/article/details/*
// @match        *://www.baidu.com/s*
// @match        *://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi?*
// @match        *://c.pc.qq.com/middlem.html?pfurl*
// @match        *://mac-torrent-download.net/pw*
// @match        https://www.google.com
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function getCookie(name) {
        name = name + "=";

        var ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }

    var domain = document.domain;

    if (domain.indexOf('google.com') > -1) {
        var e = document.getElementsByClassName('gb_d');

        for (var i in e) {
            var item = e[i];

            if (item.getAttribute('data-pid') === '2') {
                item.href = item.href.replace(/https:\/\/.*?\//, 'https://' + document.domain + '/');
            }
        }
    }

    if (domain.indexOf('baidu.com') > -1) {
        $('#wrapper_wrapper').bind('DOMSubtreeModified', function () {
            var rightContent = $(this).find('#content_right')
            if (rightContent) {
                rightContent.hide();
            }
        });
    } else if (domain.indexOf('csdn.net') > -1) {
        if (!getCookie('unlogin_scroll_step')) {
            $('head').append('<style>.login-mark{display:none!important;}#passportbox{display:none!important;}</style>');
        }

        // 移除限高
        $('.set-code-hide,.prettyprint').css('height', 'auto');
        // 移除阅读更多按钮
        $('.hide-preCode-box').remove();

        // 监听剪切板
        $(document.body).bind('copy', function (e) {
            var clipboard = window.clipboardData; // IE

            if (clipboard === undefined) {
                clipboard = e.originalEvent.clipboardData;
            }

            var clipboardStr = clipboard.getData('text');

            if (clipboardStr !== '' && clipboardStr.indexOf('版权声明：本文为CSDN博主') !== -1) {
                var regex = /(\n—[^]+)/mg;

                clipboardStr = clipboardStr.replace(regex, '');

                if (clipboardStr !== '') {
                    clipboard.setData('text', clipboardStr);
                }
            }
        });
    } else if (domain.indexOf('weixin110.qq.com') > -1) {
        var wxpatt = new RegExp(/(?<=cgiData = ).*(?=;)/g);
        var data = wxpatt.exec(document.body.getElementsByTagName('script')[0].text);

        data = JSON.parse(data);

        if (data.url) {
            var url = data.url.replace(/&#x2f;/g, '/');
            url = url.replace(/amp;/g, '&');
            location.href = url;
        }
    } else if (domain.indexOf('c.pc.qq.com') > -1) {
        var qqpatt = new RegExp(/(?<=">).*/g);

        location.href = qqpatt.exec($('#url').html());
    } else if (domain.indexOf('mac-torrent-download.net') > -1) {
        if (location.pathname === '/pw.php') {
            var mtpwpatt = new RegExp(/(?<=atob\(').*?(?='\);)/mg);
            var realUrl = mtpwpatt.exec($('#entry-content').html());

            location.href = atob(realUrl);
        } else {
            var patt = new RegExp(/(?<=_0x54f9=\[).*?(?=];)/mg);
            var arrayStr = patt.exec($('#content').prev().html()) + '';

            arrayStr = arrayStr.replace(/\\x/g, '%');
            arrayStr = arrayStr.replace(/'/g, '"');

            var array = $.parseJSON('[' + arrayStr + ']');

            if (typeof (array) === 'object') {
                var pwd = array[array.length - 1];
                pwd = atob(pwd);

                var container = $('#password-container');

                container.on('DOMNodeInserted', function () {
                    $(this).css({
                        'background-color': '#7bc74d',
                        'color': 'white',
                        'cursor': 'pointer'
                    });

                    var passwd = $('#passwd');
                    passwd.css('cursor', 'pointer');
                    passwd.val(pwd);
                });

                container.click(function () {
                    var clipboard = window.clipboardData; // IE

                    if (clipboard === undefined) {
                        const el = document.createElement('textarea');
                        el.value = pwd;
                        document.body.append(el);

                        el.select();
                        document.execCommand('copy');
                    } else {
                        clipboard.setData(pwd);
                    }

                    alert('Copied!');
                });
            }
        }
    }
})();
