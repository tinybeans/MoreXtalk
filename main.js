(function($){

    // Init
    var eventUnique = false;
    var titles = $('#title, #title_file, #title_cite');
    var inputPacks = titles.closest('.post_input_pack');
    var scriptUrl = $('#logo h1 a').attr('href').replace(/(.*blog_id=\d+)(.*)/,'$1');
    var tagsUrl = scriptUrl + '&type=tags';
    var usersUrl = scriptUrl + '&type=following';
    var currentTitle;
    titles.focus(function(){
        currentTitle = this;
    });
    $('body').append('<div id="morextalk_box" style="display: none;"><ul id="morextalk_list_box"></ul></div>');
    var postOf = $('#post').offset();
    var morextalkBox = $('#morextalk_box').css({ top: postOf.top, left: postOf.left + 583 });

    // Get Tags
    $.ajax({
        cache: false,
        dataType: 'html',
        url: tagsUrl,
        success: function(html){
            assist(html, 'tag');
        }
    });

    // Get Following users
    $.ajax({
        cache: false,
        dataType: 'html',
        url: usersUrl,
        success: function(html){
            assist(html, 'user');
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
    // Assist in typing
    function assist (html, target) {
        var item = $(html).find('#talks').html();
        var items = [];
        if (target === 'tag') {
            items = item.replace(/<.*?>|\s/g,'')
                        .replace(/\(\d+\)/g,',')
                        .replace(/,$/g,'')
                        .split(',');
        } else if (target === 'user') {
            item = item.replace(/\s/g,'');
            var p = /(author=)([^"]+)/g;
            var n = 0;
            while ((matches = p.exec(item)) != null){
                items.push(matches[2]);
                items.sort();
                n++;
                if (n > 10000) {
                    break;
                }
            }
        }
        items.sort();
        for (var i = 0, n = items.length; i < n; i++) {
            items[i] = '<li>' + items[i] + '</li>';
        }
        var listBox = $('#morextalk_list_box');
        $.data(listBox[0], target + '_html', items.join(''));
        var assistMode = false;
        var typing = '';
        listBox.delegate('li', 'click', function(){
            var typingReg = new RegExp('^' + typing, '');
            var tag = $(this).text().replace(typingReg, '');
            var v = currentTitle.value;
            var caret = getCaret(currentTitle);
            currentTitle.value = caret.prevAll + tag + caret.nextAll;
            currentTitle.selectionStart = caret.prevAll.length + tag.length;
            currentTitle.selectionEnd = caret.prevAll.length + tag.length;
            assistMode = false;
        });
        if (eventUnique) {
            return;
        }
        titles
            .keydown(function(e){
                var caret = getCaret(this);
                if (assistMode) {
                    switch (e.which) {
                        case 13: // Enter
                            var typingReg = new RegExp('^' + typing, '');
                            var tag = listBox.find('.current').text().replace(typingReg, '');
                            this.value = caret.prevAll + tag + caret.nextAll;
                            this.selectionStart = caret.prevAll.length + tag.length;
                            this.selectionEnd = caret.prevAll.length + tag.length;
                            morextalkBox.hide();
                            assistMode = false;
                            return false;
                        case 40: // down
                            moveCurrent(this, caret.position, 'next', listBox);
                            return false;
                        case 38: // up
                            moveCurrent(this, caret.position, 'prev', listBox);
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
                        assistMode = false;
                        typing = '';
                        morextalkBox.hide();
                        listBox[0].innerHTML = items.join('');
                        break;
                    case '#':
                        assistMode = true;
                        typing = '';
                        var tagHtml = $.data(listBox[0], 'tag_html');
                        $.data(listBox[0], 'current_html', tagHtml);
                        listBox[0].innerHTML = tagHtml;
                        morextalkBox.show();
                        break;
                    case '@':
                        assistMode = true;
                        typing = '';
                        var userHtml = $.data(listBox[0], 'user_html');
                        $.data(listBox[0], 'current_html', userHtml);
                        listBox[0].innerHTML = userHtml;
                        morextalkBox.show();
                        break;
                    default:
                        if (!assistMode) return;
                        typing += String.fromCharCode(e.which).toLowerCase().replace(/[^-_.!~*'\(\)a-zA-Z0-9;\/?:\&=+\$,%]/,'');
                        var reg = new RegExp('<li[^<]*>' + typing + '[^<]+</li>','g');
                        var htmlOrg = $.data(listBox[0], 'current_html');
                        var html = htmlOrg.match(reg);
                        if (html != null) {
                            listBox[0].innerHTML = html.join('');
                        } else {
                            listBox[0].innerHTML = '<li>No Match</li>';
                        }
                }
            }); // keyup
        eventUnique = true;
    }

    function moveCurrent (elm, caretPos, direction, listBox) {
        var current = listBox.find('.current');
        if (current.length > 0 && direction == 'next') {
            current.removeClass('current').next().addClass('current');
        } else if (current.length > 0 && direction == 'prev') {
            current.removeClass('current').prev().addClass('current');
        } else if (direction == 'next') {
            listBox.find('li:first-child').addClass('current');
        } else if (direction == 'prev') {
            listBox.find('li:last-child').addClass('current');
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