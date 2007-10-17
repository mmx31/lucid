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

from backend.configuration import DATABASE_ENGINE, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD
import MySQLdb

class db:
    """
    A db wrapper API that does things like connecting to the database
    """
    connection = None
    def connect(self):
        if DATABASE_ENGINE is 'mysql':
            connection = MySQLdb.connect(host=(DATABASE_HOST or "localhost"),
                                         user=DATABASE_USER,
                                         passwd=DATABASE_PASSWORD,
                                         db=DATABASE_NAME,
                                         port=(DATABASE_PORT or 3306))
            return db(connection=connection)
    def query(self, string):
        #TODO: put some sort of cross-db thing in here so it will
        #*maybe* convert any standard sqlite query into the right query
        #or something like that
        self.connection.execute(string)
    def close(self):
        self.connection.close()