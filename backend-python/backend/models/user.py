#    Psych Desktop
#    Copyright (C) 2006 Psychiccyberfreak
#
#    This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation; version 2 of the License.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License along
#    with this program; if not, write to the Free Software Foundation, Inc.,
#    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

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