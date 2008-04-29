#    Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
#    All Rights Reserved.
#
#    Licensed under the Academic Free License version 2.1 or above.



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