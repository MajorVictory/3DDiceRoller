"use strict";

import {Teal} from './Teal.js';

export class TealChat {

    constructor(place) {
        this.place = place;
        this.text = Teal.element('div', { style: 'display: inline-block; vertical-align: bottom; width: 100%', 'class': 'teal-chat-log' }, place);
        this.area = Teal.element('textarea', { 'class': 'teal-chat-input' }, this.text);
        this.last_user = undefined;
        this.own_user = undefined;
        this.last_message = '';
        this.clientid = undefined;
    }
    
    resize(w, h) {
        this.place.style.width = w + 'px';
        this.place.style.height = h + 'px';
    }

    insert_text(m) {
        var scroll = this.place.scrollHeight - this.place.scrollTop == this.place.offsetHeight;
        this.text.insertBefore(m, this.area);
        if (scroll) this.place.scrollTop = this.place.scrollHeight;
    }

    add_unconfirmed_message(user, text, time, uuid, just_uuid) {
        var m = this.form_message(user, text, time);
        Teal.clas(m, undefined, 'teal-chat-has-uuid' + (just_uuid ? '' : ' teal-chat-unconfirmed'));
        Teal.set(m, { uuid: uuid });
        this.insert_text(m);
        this.last_user = user;
    }

    confirm_message(uuid, newtext, keep_uuid) {
        var list = Teal.get_elements_by_class('teal-chat-has-uuid', this.text);
        for (var i = 0, l = list.length; i < l; ++i) {
            if (list[i].getAttribute('uuid') != uuid) continue;
            if (newtext) {
                var scroll = this.place.scrollHeight - this.place.scrollTop == this.place.offsetHeight;
                var tt = Teal.get_elements_by_class('teal-chat-text', list[i])[0];
                Teal.empty(tt);
                Teal.inner(newtext, tt);
                if (scroll) this.place.scrollTop = this.place.scrollHeight;
            }
            if (!keep_uuid) list[i].removeAttribute('uuid');
            Teal.clas(list[i], 'teal-chat-unconfirmed' + (keep_uuid ? '' : ' teal-chat-has-uuid'));
            return;
        }
    }

    add_info(text, time, color) {
        var m = Teal.element('p', {});
        var t = new Date(); if (time) t.setTime(time);
        t = t.toTimeString().substring(0, 5);
        m.innerHTML = '<span class="teal-chat-time">' + t + '</span> '
            + '<span class="teal-chat-info" ' + (color != undefined ? ' style="color: ' + color + '"' : '')
            + '>' + text.replace(/\n/g, '<br/>') + '</span>';
        this.insert_text(m);
    }

    add_message(user, text, time) {
        this.insert_text(this.form_message(user, text, time));
        this.last_user = user;
    }

    form_message(user, text, time) {
        var m = Teal.element('p', { 'class': 'teal-chat-row' + (user == this.own_user ? '-own' : '') });
        var t = new Date(); if (time) t.setTime(time);
        t = t.toTimeString().substring(0, 5);
        m.innerHTML = '<span class="teal-chat-time">' + t + '</span> <span class="teal-chat-user">' 
            + user + '</span><span>: </span>';
        Teal.inner(text, Teal.element('span', { 'class': 'teal-chat-text' }, m));
        return m;
    }

    bind_send(callback) {
        var box = this;
        Teal.bind(this.area, 'keydown', function(ev) {
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
}

