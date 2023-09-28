
import sqlite3 as sql   # create a database
import re, json, datetime

DBNAME = 'myDB.sqlite';

def makeDB():
    global DBNAME
    conn = sql.connect(DBNAME)
    conn.execute('pragma foreign_keys=ON')        # this is necessary to use foreign keys / references
    c = conn.cursor()
    
    # create table with "global" fields: {id, email, customer_id}
    c.execute(''' CREATE TABLE users(
        userid      TEXT NOT NULL, 
        email       TEXT,
        customer_id TEXT,
        PRIMARY KEY (userid),
        UNIQUE(userid)
    )''')
    
    # create table with fields: {id, name}
    c.execute(''' CREATE TABLE project(
        project_name    TEXT,
        userid          TEXT NOT NULL, 
        created         TEXT,
        FOREIGN KEY(userid) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE
    )''')
    
    # create table with design guide data
    c.execute(''' CREATE TABLE design_guide(
            userid          TEXT NOT NULL,
            project_name    TEXT,
            data            BLOB,
            FOREIGN KEY(userid) REFERENCES users(userid)
    )''' )
    
    # create table with design guide data
    c.execute(''' CREATE TABLE design_guide_temp(
            userid          TEXT,
            data            BLOB,
            FOREIGN KEY(userid) REFERENCES users(userid)
    )''' )
    
    # create table with sample size tool data
    c.execute(''' CREATE TABLE samplesize(
            userid          TEXT NOT NULL,
            project_name    TEXT,
            data            BLOB,
            FOREIGN KEY(userid) REFERENCES users(userid)
    )''' )
    
    # create table with power size tool data
    c.execute(''' CREATE TABLE powersize(
            userid          TEXT NOT NULL,
            project_name    TEXT,
            data            BLOB,
            FOREIGN KEY(userid) REFERENCES users(userid)
    )''' )
    
    # create table with graph stuff
    c.execute(''' CREATE TABLE graph(
            name            TEXT,
            userid          TEXT NOT NULL,
            project_name    TEXT,
            data            TEXT,
            FOREIGN KEY(userid) REFERENCES users(userid)
    )''' )
    
    conn.commit()
    conn.close()

def create_DB_from_auth0_file(fname):
    makeDB()
    json_list = load_auth0_json( fname )
    create_auth0_users( json_list )
    
# load the JSON file provided from Auth0
def load_auth0_json( fname ):
    
    with open(fname) as f:
        lines = f.readlines()
    
    for ii in range( len(lines) ):
        lines[ii] = json.loads( lines[ii] )
    
    return lines
    
# From a list of dict objects, insert users into the database
def create_auth0_users( json_list ):
    global DBNAME
    conn = sql.connect(DBNAME)
    c = conn.cursor()

    # create a user and empty project associated with that user
    for tmp in json_list:
        user_id = tmp["Id"]
        user_id = re.sub("auth0\|", "", user_id)    # parse out the "auth0|" in front of the id
        metadata = tmp["user_metadata"]
        c.execute("INSERT INTO users(userid,email,customer_id) VALUES(?,?,?)", (user_id, tmp["Email"],metadata["customer_id"]))
        c.execute("INSERT INTO project(project_name,userid,created) VALUES(?,?,?)", ("MyFirstProject", user_id, str(datetime.datetime.now())) )
    
    conn.commit()
    conn.close()
    
def exampleFill():
    global DBNAME
    conn = sql.connect(DBNAME)
    c = conn.cursor()

    # example for table population
    userID       = 'xght67r'
    project_name = 'kristinProject'
    c.execute("INSERT INTO users(userid,email,customer_id) VALUES(?,?,?)", (userID, 'kholmbeck@mac.com','cus_stripe_key'))
    c.execute("INSERT INTO project(project_name,userid,email) VALUES(?,?,?)", (project_name, userID, 'kholmbeck@mac.com'))
    c.execute("INSERT INTO graph(name,project_name,userid) VALUES(?,?,?)", ('kholmbeck', project_name,userID))
    c.execute("INSERT INTO graph(name,project_name,userid) VALUES(?,?,?)", ('kholmbeck2', project_name,userID))
    
    conn.commit()
    conn.close()


def saveGraph(userid, project_name, dataURI, plotname):
    global DBNAME
    conn = sql.connect(DBNAME)
    c = conn.cursor()
    
    if plotname == 'sim':
        #get index of last plot, enumerate?
        a = 1
    
    # need userid and project name
    # need to know if updating/replacing existing graph or creating a new one
    c.execute("INSERT INTO graph(name, userid, project_name, data) VALUES(?,?,?,?)", (plotname, userid, project_name, dataURI))
    
    conn.commit()
    conn.close()

#create_DB_from_auth0_file("webmaster.json")
