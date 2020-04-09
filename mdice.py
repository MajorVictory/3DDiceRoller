import webapp2
import logging
import json
import uuid
import time
from google.appengine.api import channel
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.api import memcache

root = '/mdice/'
max_players = 20

class Game(db.Model):
    cid = db.StringProperty()
    user = db.StringProperty()
    room = db.StringProperty()
    create_time = db.DateTimeProperty(auto_now = True)

def mdice_message_users_of_room(room, act, user):
    games = Game.gql("WHERE room = :1", room).fetch(max_players)
    res = []
    for game in games:
        res.append(game.user)
    for game in games:
        channel.send_message(game.cid, json.dumps({ 'action': 'userlist',
                    'list': res, 'room': room, 'act': act, 'user': user }))

def mdice_client_add(cid):
    d = memcache.get_multi(keys = ('user', 'room'), key_prefix = cid)
    res = Game.gql("WHERE room = :1", d['room'])
    games = res.fetch(max_players)
    if len(games) == max_players:
        channel.send_message(cid, json.dumps({
                        'error': 'too many players already in room' })) 
        return
    for game in games:
        if games[0].user == d['user']:
            channel.send_message(cid, json.dumps({
                        'error': 'room already has player ' + d['user'] + ' joined' }))
            return
    game = Game(cid = cid, user = d['user'], room = d['room'])
    game.put()
    time.sleep(3)
    channel.send_message(cid, json.dumps({ 'action': 'login' }))
    mdice_message_users_of_room(d['room'], 'add', d['user'])

def mdice_client_delete(cid):
    games = Game.all().filter('cid = ', cid).fetch(max_players)
    if len(games):
        room = games[0].room
        user = games[0].user
        db.delete(games)
        time.sleep(3)
        mdice_message_users_of_room(room, 'del', user)

class MDiceHandler(webapp2.RequestHandler):
    def post(self):
        self.response.headers['Content-Type'] = 'application/json-rpc'
        data = json.loads(self.request.body)
        if data['method'] == 'random':
            req = {
                "jsonrpc": "2.0",
                "method": "generateDecimalFractions",
                "params": {
                    'apiKey': 'f6e74d7b-070e-4f85-865d-d859fc0d078b',
                    'n': data['n'],
                    'decimalPlaces': 2,
                },
                "id": 1
            }
            result = urlfetch.fetch(
                url = 'https://api.random.org/json-rpc/1/invoke',
                payload = json.dumps(req),
                method = urlfetch.POST,
                headers = { 'Content-Type': 'application/json-rpc' },
                validate_certificate = False
            )
            self.response.write(result.content)
            return

        if data['method'] == 'join':
            user = data['user']
            room = data['room']

            if user == "" or room == "":
                self.response.write(json.dumps({ 'error': 'player or room name are too short' }))
                return

            cid = 'mdice' + str(uuid.uuid4())
            tid = channel.create_channel(cid)

            memcache.set_multi({ 'user': user, 'room': room }, time = 3600, key_prefix = cid)
            self.response.write(json.dumps({ 'tid': tid, 'cid': cid }))
            return

        if data['method'] == 'roll':
            cid = data['cid']
            notation = data['notation']
            vectors = data['vectors']
            mt = data['time']
            games = Game.gql("WHERE cid = :1", cid).fetch(1)
            if (len(games)):
                user = games[0].user;
                games = Game.gql("WHERE room = :1", games[0].room).fetch(max_players)
                dump = json.dumps({ 'action': 'roll', 'user': user, 
                        'notation': notation, 'vectors': vectors, 'time': mt })
                for game in games:
                    channel.send_message(game.cid, dump)
            self.response.write('{}')
            return

        if data['method'] == 'chat':
            cid = data['cid']
            text = data['text']
            mt = data['time']
            mid = data['uuid']
            games = Game.gql("WHERE cid = :1", cid).fetch(1)
            if (len(games)):
                user = games[0].user;
                games = Game.gql("WHERE room = :1", games[0].room).fetch(max_players)
                dump = json.dumps({ 'action': 'chat', 'user': user, 'text': text, 'time': mt })
                for game in games:
                    if game.cid == cid:
                        channel.send_message(game.cid, json.dumps({ 'action': 'chat', 'uuid': mid }))
                    else:
                        channel.send_message(game.cid, dump)
            self.response.write('{}')
            return

        self.response.write('{}')

app = webapp2.WSGIApplication([
        (root + 'f', MDiceHandler),
    ], debug = True)

