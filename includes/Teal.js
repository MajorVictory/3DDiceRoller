"use strict";

export class Teal {

    /**
     * Ctor. Create and initialize a new Dice3d.
     */
    constructor() { 
		this.offline = true;
		this.socket = null;
		this.socketAddress = 'dnd.majorsplace.com:32400';
		this.socketSecure = false;
        window.Teal = this;
    }

    static copyto(obj, res) {
        if (obj == null || typeof obj !== 'object') return obj;
        if (obj instanceof Array) {
            for (var i = obj.length - 1; i >= 0; --i)
                res[i] = Teal.copy(obj[i]);
        }
        else {
            for (var i in obj) {
                if (obj.hasOwnProperty(i))
                    res[i] = Teal.copy(obj[i]);
            }
        }
        return res;
    }

    static copy(obj) {
        if (!obj) return obj;
        return Teal.copyto(obj, new obj.constructor());
    }

    static hidden(obj, hidden, display = 'block') {
        if(!obj) return;
        obj.style.display = (hidden) ? 'none' : display;
        obj.style.visibility = (hidden) ? 'hidden' : 'visible';
    }

    static element(name, props, place, content) {
        var dom = document.createElement(name);
        if (props) for (var i in props) dom.setAttribute(i, props[i]);
        if (place) place.appendChild(dom);
        if (content !== undefined) Teal.inner(content, dom);
        return dom;
    }

    static inner(obj, sel) {
        sel.appendChild(obj.nodeName != undefined ? obj : document.createTextNode(obj));
        return sel;
    }

    static id(id) {
        return document.getElementById(id);
    }

    static set(sel, props) {
        if (!sel) return sel;
        for (var i in props) sel.setAttribute(i, props[i]);
        return sel;
    }

    static selectByValue(sel, value) {
        for(var i=0;i<sel.options.length;i++){
            if (sel.options[i].value == value) {
                sel.selectedIndex = i;
                return;
            }
        }
        sel.selectedIndex = -1;
    }

    static clas(sel, oldclass, newclass) {
        var oc = oldclass ? oldclass.split(/\s+/) : [],
            nc = newclass ? newclass.split(/\s+/) : [],
            classes = (sel.getAttribute('class') || '').split(/\s+/);
        if (!classes[0]) classes = [];
        for (var i in oc) {
            var ind = classes.indexOf(oc[i]);
            if (ind >= 0) classes.splice(ind, 1);
        }
        for (var i in nc) {
            if (nc[i] && classes.indexOf(nc[i]) < 0) classes.push(nc[i]);
        }
        sel.setAttribute('class', classes.join(' '));
    }

    static empty(sel) {
        if (sel.childNodes)
            while (sel.childNodes.length)
                sel.removeChild(sel.firstChild);
    }

    static remove(sel) {
        if (sel) {
            if (sel.parentNode) sel.parentNode.removeChild(sel);
            else for (var i = sel.length - 1; i >= 0; --i)
                sel[i].parentNode.removeChild(sel[i]);
        }
    }

    static bind(sel, eventname, func, bubble) {
        if (!sel) return;
        if (eventname.constructor === Array) {
            for (var i in eventname)
                sel.addEventListener(eventname[i], func, bubble ? bubble : false);
        }
        else
            sel.addEventListener(eventname, func, bubble ? bubble : false);
    }

    static unbind(sel, eventname, func, bubble) {
        if (eventname.constructor === Array) {
            for (var i in eventname)
                sel.removeEventListener(eventname[i], func, bubble ? bubble : false);
        }
        else
            sel.removeEventListener(eventname, func, bubble ? bubble : false);
    }

    static one(sel, eventname, func, bubble) {
        var one_func = function(e) {
            func.call(this, e);
            Teal.unbind(sel, eventname, one_func, bubble);
        };
        Teal.bind(sel, eventname, one_func, bubble);
    }

    static raise_event(sel, eventname, bubble, cancelable) {
        var evt = document.createEvent('UIEvents');
        evt.initEvent(eventname, bubble == undefined ? true : bubble,
                cancelable == undefined ? true : cancelable);
        sel.dispatchEvent(evt);
    }

    static raise(sel, eventname, params, bubble, cancelable) {
        var ev = document.createEvent("CustomEvent");
        ev.initCustomEvent(eventname, bubble, cancelable, params);
        sel.dispatchEvent(ev);
    }

    static get_elements_by_class(classes, node) {
        return (node || document).getElementsByClassName(classes);
    }

    static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static get_url_params() {
        var params = window.location.search.substring(1).split("&");
        var res = {};
        for (var i in params) {
            var keyvalue = params[i].split("=");
            res[keyvalue[0]] = decodeURI(keyvalue[1]);
        }
        return res;
    }

    static get_mouse_coords(ev) {
        if (ev && ev.changedTouches && ev.changedTouches.length > 0) return { x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY };
        return { x: ev.clientX, y: ev.clientY };
    }

    static deferred() {
        var solved = false, callbacks = [], args = [];
        function solve() {
            while (callbacks.length) {
                callbacks.shift().apply(this, args);
            }
        }
        return {
            promise: function() {
                return {
                    then: function(callback) {
                        var deferred = Teal.deferred(), promise = deferred.promise();
                        callbacks.push(function() { 
                            var res = callback.apply(this, arguments);
                            if (res && 'done' in res) res.done(deferred.resolve);
                            else deferred.resolve.apply(this, arguments); 
                        });
                        return promise;
                    },
                    done: function(callback) {
                        callbacks.push(callback);
                        if (solved) solve();
                        return this;
                    },
                    cancel: function() {
                        callbacks = [];
                    }
                };
            },
            resolve: function() {
                solved = true;
                args = Array.prototype.slice.call(arguments, 0);
                solve();
            }
        };
    }

    static when(promises) {
        var deferred = Teal.deferred();
        var count = promises.length, ind = 0;
        if (count == 0) deferred.resolve();
        for (var i = 0; i < count; ++i) {
            promises[i].done(function() {
                if (++ind == count) deferred.resolve();
            });
        }
        return deferred.promise();
    }

    static pack_vectors(vectors) {
        function pack(vv) {
            vv.x = Math.floor(vv.x * 1000);
            vv.y = Math.floor(vv.y * 1000);
            vv.z = Math.floor(vv.z * 1000);
            if (vv.a) {
                vv.a = Math.floor(vv.a * 1000);
                return [vv.x, vv.y, vv.z, vv.a];
            }
            else return [vv.x, vv.y, vv.z];
        }
        for (var i in vectors) {
            var v = vectors[i];
            vectors[i] = [
                v.type,
                v.op,
                v.sid || 0,
                v.gid || 0,
                v.glvl || 0,
                v.func || '',
                v.args || '',
                pack(v.pos),
                pack(v.velocity),
                pack(v.angle),
                pack(v.axis)
            ];
        }
    }

    static unpack_vectors(vectors) {
        function unpack(vv) {
            var r = {};
            r.x = vv[0] / 1000.0;
            r.y = vv[1] / 1000.0;
            r.z = vv[2] / 1000.0;
            if (vv[3]) r.a = vv[3] / 1000.0;
            return r;
        }
        for (var i in vectors) {
            var v = vectors[i];
            vectors[i] = { 
                type: v[0], 
                op: v[1],
                sid: v[2],
                gid: v[3],
                glvl: v[4], 
                func: v[5], 
                args: v[6], 
                pos: unpack(v[7]), 
                velocity: unpack(v[8]), 
                angle: unpack(v[9]), 
                axis: unpack(v[10])
            };
        }
    }


    openSocket(address, secure) {

		address = (secure || this.socketSecure) ? 'wss://'+(address || this.socketAddress) : 'ws://'+(address || this.socketAddress);

		this.socket = (this.socket == null || this.socket.readyState > WebSocket.OPEN) ? new WebSocket(address) : this.socket;

		//console.log(this.socket);
		return this.socket;
	}

	// should emulate an ajax send-receive loop
	// send a message, wait for one-time response
	rpc(params, callback, noparse) {

		if(this.offline) {
			if (callback != null) {
				callback.call(this.socket, params);
			}
			return;
		}

		// check if socket already open, 
		if (this.socket.readyState == WebSocket.OPEN) {

			this.socket.send(JSON.stringify(params));

			if (callback != null) {
				this.socket.addEventListener('message', function(message) {
					callback.call(this.socket, noparse ? message.data : JSON.parse(message.data));
				});
			}

		} else {
			//console.log("WebSocket Error: Socket not ready");
			//console.log("Socket Ready State: "+this.socket.readyState);
		}
	}
}