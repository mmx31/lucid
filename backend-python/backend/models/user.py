#    Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
#    All Rights Reserved.
#
#    Licensed under the Academic Free License version 2.1 or above.



from mod_python import Session
from base import Model
import backend.dbhelper.db

class User(Model):
    def get(self, id):
        if DATABASE_ENGINE is 'mysql':
            db=db.connect()
    def login(self, req):
        session = Session.Session(req)
        session['user'] = {
            'id': self.id,
            'name': self.name,
            'username': self.username,
            'level': self.level,
        }
        session.save()