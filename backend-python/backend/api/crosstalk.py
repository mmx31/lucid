#    Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
#    All Rights Reserved.
#
#    Licensed under the Academic Free License version 2.1 or above.



from mod_python import Session

def index(req):
    req
    return "foo"

def checkForEvents(req):
    session = Session.Session(req)
    