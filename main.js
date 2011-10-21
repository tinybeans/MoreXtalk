(function($){

    // Init
    var titles = $('#title, #title_file, #title_cite');
    var inputPacks = titles.closest('.post_input_pack');
/*     var msgSub = $('#form_default').find('.msg_sub'); */
    var tagsUrl = location.href.replace(/(.*blog_id=\d+)(.*)/,'$1') + '&type=tags';

    $('body').append('<div id="tag_box" style="display: none;"><ul id="tag_box_list"></ul></div>');
    var postOf = $('#post').offset();
    var tagBox = $('#tag_box').css({ top: postOf.top, left: postOf.left + 583 });
/* $('.post_menu').prepend('<li><a href="#">すべてのタグ</a></li>'); */

    // Get Tags
    $.ajax({
        cache: false,
        dataType: 'html',
        url: tagsUrl,
        success: function(html){
            var tags = $(html).find('#talks').html();
            tags = tags.replace(/<.*?>|\s/g,'')
                       .replace(/\(\d+\)/g,',')
                       .replace(/,$/g,'')
                       .split(',');
            for (var i = 0, n = tags.length; i < n; i++) {
                tags[i] = '<li>' + tags[i] + '</li>';
            }
            $('#tag_box_list')[0].innerHTML = tags.join('');
/*
            var tag_html = [
                '<span class="insert_tag_list_open">すべてのタグ</span>',
                '<div class="insert_tag_list">' + tags.sort().join('') + '</div>'
            ];
            inputPacks
                .append(tag_html.join(''))
                    .find('a').click(function(){
                        var title = $('#title:visible, #title_cite:visible').eq(0);
                        var v = title.val();
                        if (v == '') {
                            title.val($(this).text() + ' ');
                        } else {
                            title.val(v + ' ' + $(this).text());
                        }
                    });
            $('#title:visible, #title_cite:visible').focus(function(){
                $('div.insert_tag_list').slideDown('fast');
            });
*/
/*
            $('div.insert_tag_list_open').click(function(){
                $('div.insert_tag_list').slideToggle('fast');
            });
*/

            var tagMode = false;
            var typing = '';
            titles
                .keydown(function(e){
                    var caretPos = this.selectionStart;
                    if (tagMode) {
                        switch (e.which) {
                            case 13: // Enter
                                var tag = $('#tag_box_list').find('.current').text();
                                var v = this.value;
                                var caretPrevAll = v.slice(0, caretPos);
                                var caretNextAll = v.slice(caretPos);
                                this.value = caretPrevAll + tag + caretNextAll;
                                this.selectionStart = caretPrevAll.length + tag.length;
                                this.selectionEnd = caretPrevAll.length + tag.length;
                                return false;
                            case 40: // down
                                moveCurrent(this, caretPos, 'next');
                                return false;
                            case 38: // up
                                moveCurrent(this, caretPos, 'prev');
                                return false;
                        }
                    }
                }) // keydown
                .keyup(function(e){
                    var v = this.value;
                    var caretPos = this.selectionStart;
                    var caretPrev = v.slice(caretPos - 1, caretPos);
                    var caretPrevAll = v.slice(0, caretPos);
                    var caretNextAll = v.slice(caretPos);
                    switch (caretPrev) {
                        case ' ':
                            tagMode = false;
                            typing = '';
                            tagBox.hide();
                            $('#tag_box_list')[0].innerHTML = tags.join('');
                            break;
                        case '#':
                            tagMode = true;
                            typing = '';
                            tagBox.show();
                            break;
                        default:
                            if (!tagMode) return;
                            typing += String.fromCharCode(e.which).toLowerCase();
                            var reg = new RegExp('<li[^<]*>' + typing + '[^<]*</li>','g');
                            var htmlOrg = tags.join('');
                            var html = htmlOrg.match(reg);
                            $('#tag_box_list')[0].innerHTML = html.join('');
                    }
                }); // keyup
        }
    });

    // Reply to all
    var loginUser = $('#global_menu').find('li:eq(1)').text();
    $('img[alt="reply"]').parent().click(function(e){
        var title = $('#title');
        var msgSubText = title.parent().next().text();
        var user = msgSubText.match(/@\S+/g);
        if (user == null) {
            return false;
        }
        var users = [];
        for (var i = 0, n = user.length; i < n; i++) {
            if (loginUser != user[i]) {
                users.push(user[i]);
            }
        }
        if (users.length > 0) {
            users = users.join(' ') + ' ';
        } else {
            return false;
        }
        var insLength = users.length;
        var titleVal = title[0].value;
        var insPos = titleVal.length;
        title[0].value = titleVal + users;
        title[0].selectionStart = insPos;
        title[0].selectionEnd = insPos + insLength;
        return false;
    });

    // Fuction
    function moveCurrent (elm, caretPos, direction) {
        var tagBoxList = $('#tag_box_list');
        var current = tagBoxList.find('.current');
        if (current.length > 0 && direction == 'next') {
            current.removeClass('current').next().addClass('current');
        } else if (current.length > 0 && direction == 'prev') {
            current.removeClass('current').prev().addClass('current');
        } else if (direction == 'next') {
            tagBoxList.find('li:first-child').addClass('current');
        } else if (direction == 'prev') {
            tagBoxList.find('li:last-child').addClass('current');
        }
        elm.selectionStart = caretPos;
        elm.selectionEnd = caretPos;
    }

})(jQuery);