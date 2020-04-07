import webapp2
import logging
import json
from google.appengine.api import urlfetch

root = '/dice/'

class DiceHandler(webapp2.RequestHandler):
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

        self.response.write('{}')

app = webapp2.WSGIApplication([
        (root + 'f', DiceHandler),
    ], debug = True)

