"use strict";

(function(chat) {

    this.chat_box = function(place) {
        this.place = place;
        this.text = $t.element('div', { style: 'display: inline-block; vertical-align: bottom; width: 100%', 'class': 'teal-chat-log' }, place);
        this.area = $t.element('textarea', { 'class': 'teal-chat-input' }, this.text);
        this.last_user = undefined;
        this.own_user = undefined;
        this.last_message = '';
    }
    
    this.chat_box.prototype.resize = function(w, h) {
        this.place.style.width = w + 'px';
        this.place.style.height = h + 'px';
    }

    function insert_text(m) {
        var scroll = this.place.scrollHeight - this.place.scrollTop == this.place.offsetHeight;
        this.text.insertBefore(m, this.area);
        if (scroll) this.place.scrollTop = this.place.scrollHeight;
    }

    this.chat_box.prototype.add_unconfirmed_message = function(user, text, time, uuid, just_uuid) {
        var m = this.form_message(user, text, time);
        $t.clas(m, undefined, 'teal-chat-has-uuid' + (just_uuid ? '' : ' teal-chat-unconfirmed'));
        $t.set(m, { uuid: uuid });
        insert_text.call(this, m);
        this.last_user = user;
    }

    this.chat_box.prototype.confirm_message = function(uuid, newtext, keep_uuid) {
        var list = $t.get_elements_by_class('teal-chat-has-uuid', this.text);
        for (var i = 0, l = list.length; i < l; ++i) {
            if (list[i].getAttribute('uuid') != uuid) continue;
            if (newtext) {
                var scroll = this.place.scrollHeight - this.place.scrollTop == this.place.offsetHeight;
                var tt = $t.get_elements_by_class('teal-chat-text', list[i])[0];
                $t.empty(tt);
                $t.inner(newtext, tt);
                if (scroll) this.place.scrollTop = this.place.scrollHeight;
            }
            if (!keep_uuid) list[i].removeAttribute('uuid');
            $t.clas(list[i], 'teal-chat-unconfirmed' + (keep_uuid ? '' : ' teal-chat-has-uuid'));
            return;
        }
    }

    this.chat_box.prototype.add_info = function(text, time, color) {
        var m = $t.element('p', {});
        var t = new Date(); if (time) t.setTime(time);
        t = t.toTimeString().substring(0, 5);
        m.innerHTML = '<span class="teal-chat-time">' + t + '</span> '
            + '<span class="teal-chat-info" ' + (color != undefined ? ' style="color: ' + color + '"' : '')
            + '>' + text.replace(/\n/g, '<br/>') + '</span>';
        insert_text.call(this, m);
    }

    this.chat_box.prototype.add_message = function(user, text, time) {
        insert_text.call(this, this.form_message(user, text, time));
        this.last_user = user;
    }

    this.chat_box.prototype.form_message = function(user, text, time) {
        var m = $t.element('p', { 'class': 'teal-chat-row' + (user == this.own_user ? '-own' : '') });
        var t = new Date(); if (time) t.setTime(time);
        t = t.toTimeString().substring(0, 5);
        m.innerHTML = '<span class="teal-chat-time">' + t + '</span> <span class="teal-chat-user">' 
            + user + '</span><span>: </span>';
        $t.inner(text, $t.element('span', { 'class': 'teal-chat-text' }, m));
        return m;
    }

    this.chat_box.prototype.bind_send = function(callback) {
        var box = this;
        $t.bind(this.area, 'keydown', function(ev) {
            if (ev.keyCode == 13 && !ev.shiftKey) {
                ev.preventDefault();
                var text = box.area.value;
                box.area.value = '';
                if (!text.length) return;
                box.last_message = text;
                callback.call(box, text);
            }
            if (ev.keyCode == 38) {
                if (box.area.value.length != 0) return;
                ev.preventDefault();
                box.area.value = box.last_message;
            }
        });
    }
    
}).apply(teal.chat = teal.chat || {});

