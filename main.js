(function($){

    // Init
    var titles = $('#title, #title_file, #title_cite');
    var inputPacks = titles.closest('.post_input_pack');
    var tagsUrl = $('#logo h1 a').attr('href').replace(/(.*blog_id=\d+)(.*)/,'$1') + '&type=tags';
    var currentTitle;
    titles.focus(function(){
        currentTitle = this;
    });

    $('body').append('<div id="tag_box" style="display: none;"><ul id="tag_box_list"></ul></div>');
    var postOf = $('#post').offset();
    var tagBox = $('#tag_box').css({ top: postOf.top, left: postOf.left + 583 });

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
            tags.sort();
            for (var i = 0, n = tags.length; i < n; i++) {
                tags[i] = '<li>' + tags[i] + '</li>';
            }
            $('#tag_box_list')[0].innerHTML = tags.join('');
            var tagMode = false;
            var typing = '';
            $('#tag_box_list').delegate('li', 'click', function(){
                var typingReg = new RegExp('^' + typing, '');
                var tag = $(this).text().replace(typingReg, '');
                var v = currentTitle.value;
                var caret = getCaret(currentTitle);
                currentTitle.value = caret.prevAll + tag + caret.nextAll;
                currentTitle.selectionStart = caret.prevAll.length + tag.length;
                currentTitle.selectionEnd = caret.prevAll.length + tag.length;
                tagMode = false;
            });
            titles
                .keydown(function(e){
                    var caret = getCaret(this);
                    if (tagMode) {
                        switch (e.which) {
                            case 13: // Enter
                                var typingReg = new RegExp('^' + typing, '');
                                var tag = $('#tag_box_list').find('.current').text().replace(typingReg, '');
                                this.value = caret.prevAll + tag + caret.nextAll;
                                this.selectionStart = caret.prevAll.length + tag.length;
                                this.selectionEnd = caret.prevAll.length + tag.length;
                                tagMode = false;
                                return false;
                            case 40: // down
                                moveCurrent(this, caret.position, 'next');
                                return false;
                            case 38: // up
                                moveCurrent(this, caret.position, 'prev');
                                return false;
                        }
                    }
                }) // keydown
                .keyup(function(e){
                    var v = this.value;
                    var caret = getCaret(this);
                    if (e.which == 38 || e.which == 40) {
                        return false;
                    }
                    switch (caret.prev) {
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
                            typing += String.fromCharCode(e.which).toLowerCase().replace(/[^-_.!~*'\(\)a-zA-Z0-9;\/?:\&=+\$,%]/,'');
                            var reg = new RegExp('<li[^<]*>' + typing + '[^<]+</li>','g');
                            var htmlOrg = tags.join('');
                            var html = htmlOrg.match(reg);
                            if (html != null) {
                                $('#tag_box_list')[0].innerHTML = html.join('');
                            } else {
                                $('#tag_box_list')[0].innerHTML = '<li>No Match</li>';
                            }
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

    // Fuctions
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

    function getCaret (elm) {
        var v = elm.value;
        var pos = elm.selectionStart;
        return {
            position: pos,
            prev:     v.slice(pos - 1, pos),
            prevAll:  v.slice(0, pos),
            nextAll:  v.slice(pos)
        };
    }

})(jQuery);