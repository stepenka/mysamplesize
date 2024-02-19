
import sqlite3 as sql   # create a database
from app_context import re, json, os

subProjects = ["graph", "samplesize", "powersize", "design_guide"]
tableList   = ["users", "project"]

sql_path = "ShinyApps/user_files/database.sqlite";
#sql_path = "ShinyApps/user_files/db_download_BETA.sqlite";

#--------------------------------------------------------
#   Standalone functions
#--------------------------------------------------------

def updateCustomerId(user_id, email, customer_id):
    user_id = re.sub("auth0\|", "", user_id)

    con = sql.connect(sql_path)
    #con.row_factory = sql.Row
    cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE userid=?", (user_id,))
    exists = cur.fetchone();

    if exists is not None:
        cur.execute("UPDATE users SET customer_id=? WHERE userid=? AND email=?", (customer_id,user_id,email,))
        con.commit()
    else:
        makeNewUser(user_id, email, customer_id, None)
    
    con.commit()
    con.close()

    return 'OK'

def makeNewUser(user_id, email, customer_id, date):
    
    user_id = re.sub("auth0\|", "", user_id)

    con = sql.connect(sql_path)
    #con.row_factory = sql.Row
    cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE userid=?", (user_id,))
    exists = cur.fetchone();

    if exists is None:
        cur.execute("INSERT INTO users(userid,email,customer_id) VALUES(?,?,?)", (user_id,email,customer_id))
        cur.execute("INSERT INTO project(userid,project_name,created) VALUES(?,?,?)", (user_id,'MyFirstProject',date,))
        con.commit()
        
    con.commit()
    con.close()

    return 'OK'

def get_email(user_id):
    user_id = re.sub("auth0\|", "", user_id)
    
    con = sql.connect(sql_path)
    cur = con.cursor()
    cur.execute("SELECT email FROM users WHERE userid=?", (user_id,))
    sqlinfo = cur.fetchall();
    con.close()
    
    if sqlinfo:
        user_email = sqlinfo[0][0]  # this index valid if user exists
    else:
        user_email = None
        raise Exception('Could not determine email based on the user_id from the database')
    
    return user_email

def get_customer_id(user_id):
    user_id = re.sub("auth0\|", "", user_id)
    
    con = sql.connect(sql_path)
    cur = con.cursor()
    cur.execute("SELECT customer_id FROM users WHERE userid=?", (user_id,))
    sqlinfo = cur.fetchall();
    con.close()
    
    if sqlinfo:
        customer_id = sqlinfo[0][0]  # this index valid if user exists
    else:
        con = sql.connect(sql_path)
        cur = con.cursor()
        #cur.execute("SELECT customer_id FROM users WHERE userid=?", ("auth0|"+user_id,))
        cur.execute("SELECT customer_id FROM users WHERE userid=?", (user_id,))
        sqlinfo = cur.fetchall();
        con.close()
        
        customer_id = sqlinfo[0][0]  # this index valid if user exists
    
    return customer_id
    
def getProjects(user_id):
    
    con = sql.connect(sql_path)
    cur = con.cursor()
    cur.execute("SELECT project_name FROM project where userid=?", (user_id,));
    sqlprojects = cur.fetchall();
    cur.execute("SELECT created FROM project WHERE userid=?", (user_id,));
    sqltimes = cur.fetchall();
    con.close()

    alist = []
    alist2 = []
    for projectname in sqlprojects:
        alist.append(projectname[0])
    
    for created in sqltimes:
        alist2.append(created[0])
    
    # return a dict object
    data             = {}
    data["projects"] = alist;
    data["times"]    = alist2
    
    return data

def getSubProjects(user_id, project_name):
    con = sql.connect(sql_path)
    cur = con.cursor()
    
    cur.execute("SELECT rowid,name FROM graph where userid=? AND project_name=?", (user_id, project_name));
    graphs   = cur.fetchall();
    namelist = []
    rowids   = []
    projects = []
    tmp      = []
    
    ndx = 0
    for graphname in graphs:
        rowids.append( graphname[0] )
        uniqueName = "%s, plot #%d" %(graphname[1], ndx)
        namelist.append( uniqueName )
        ndx = ndx + 1
        
        tmp2          = {}
        tmp2["name"]  = uniqueName
        tmp2["rowid"] = graphname[0]
        tmp2["table"] = "graph"
        tmp.append( tmp2 )

    for table in subProjects[1:len(subProjects)]:
        cur.execute("SELECT rowid FROM "+table+" WHERE userid=? AND project_name=?", (user_id, project_name));
        data = cur.fetchall()
        
        if table.find("sample") != -1:
            uniqueName = "Sample Size Calculation"
        elif table.find("power") != -1:
            uniqueName = "Power Size Calculation"
        else:
            uniqueName = "Design Guide"
        
        ndx = 0
        for x in data:
            rowids.append( x[0] )
            #newName = "%s %d" %(uniqueName,ndx)    # enumerate
            newName = uniqueName
            namelist.append( newName )
            ndx = ndx + 1
            
            tmp2 = {}
            tmp2["name"] = newName
            tmp2["rowid"] = x[0]
            tmp2["table"] = table
            tmp.append( tmp2 )

    con.close()
    
    return tmp
    

    
def makeNewProject(user_id, tempname, date):
    con             = sql.connect(sql_path)
    con.row_factory = sql.Row
    cur             = con.cursor()
    cur.execute("INSERT INTO project (userid,project_name,created) VALUES(?,?,?)", (user_id,tempname,date,))
    con.commit()
    con.close()
    return
    
    
def deleteProject(user_id, project_name):
    con             = sql.connect(sql_path)
    con.row_factory = sql.Row
    cur             = con.cursor()
    
    cur.execute("DELETE FROM project WHERE userid=? AND project_name=?", (user_id,project_name,))
    
    for table in subProjects:
        cur.execute("DELETE FROM " + table + " WHERE userid=? AND project_name=?", (user_id,project_name,))

    con.commit()
    con.close()
    return
    
    
def deleteSubProject(user_id, project_name, table, rowid):
    con             = sql.connect(sql_path)
    con.row_factory = sql.Row
    cur             = con.cursor()
    
    cur.execute("DELETE FROM " + table + " WHERE userid=? AND project_name=? AND rowid=?", (user_id,project_name,rowid,))

    con.commit()
    con.close()
    return
    
    
def renameProject(user_id, projectname, newname):
    con = sql.connect(sql_path)
    con.row_factory = sql.Row
    cur = con.cursor()
    
    cur.execute("UPDATE project SET project_name=? WHERE userid=? AND project_name=?", (newname,user_id,projectname,))

    # update all tables that rely on project_name
    for table in subProjects:
        cur.execute("UPDATE " + table + " SET project_name=? WHERE userid=? AND project_name=?", (newname,user_id,projectname,))

    con.commit()
    con.close()
    return;

    
def saveSample(userid, project_name, data):
    conn = sql.connect(sql_path)
    c    = conn.cursor()

    c.execute("SELECT * FROM samplesize WHERE userid=? AND project_name=?", (userid,project_name,))
    exists = c.fetchone();

    if exists is None:
        c.execute("INSERT INTO samplesize(userid, project_name, data) VALUES(?,?,?)", (userid, project_name, data,))
    else:
        c.execute("UPDATE samplesize SET data=? WHERE userid=? AND project_name=?", (data, userid, project_name,))

    conn.commit()
    conn.close()
    return


def savePower(userid, project_name, data):
    conn = sql.connect(sql_path)
    c    = conn.cursor()

    c.execute("SELECT * FROM powersize WHERE userid=? AND project_name=?", (userid,project_name,))
    exists = c.fetchone();

    if exists is None:
        c.execute("INSERT INTO powersize(userid, project_name, data) VALUES(?,?,?)", (userid, project_name, data,))
    else:
        c.execute("UPDATE powersize SET data=? WHERE userid=? AND project_name=?", (data, userid, project_name,))
    
    conn.commit()
    conn.close()
    return


def saveGraph(userid, project_name, data, plotname):
    conn = sql.connect(sql_path)
    c    = conn.cursor()
    
    # need userid and project name
    # need to know if updating/replacing existing graph or creating a new one
    c.execute("INSERT INTO graph(name, userid, project_name, data) VALUES(?,?,?,?)", (plotname, userid, project_name, data))
    
    conn.commit()
    conn.close()
    return
    
def saveDesignGuideToProject(userid, project_name, data):
    conn = sql.connect(sql_path)
    c = conn.cursor()
    
    c.execute("SELECT * FROM design_guide WHERE userid=? AND project_name=?", (userid, project_name))
    exists = c.fetchone();
    
    if exists is None:
        c.execute("INSERT INTO design_guide(userid, data, project_name) VALUES(?,?,?)", (userid, data, project_name))
    else:
        c.execute("UPDATE design_guide SET data=? WHERE userid=? AND project_name=?", (data, userid, project_name))
    
    conn.commit()
    conn.close()
    return

def saveDesignGuideTempData(userid, data):
    conn = sql.connect(sql_path)
    c = conn.cursor()
    
    # userid should never be None, but for local testing (when not logged in) it could be
    if userid is None:
        c.execute("SELECT * FROM design_guide_temp WHERE userid is NULL")
        exists = c.fetchone()
    else:
        c.execute("SELECT * FROM design_guide_temp WHERE userid=?", (userid,))
        exists = c.fetchone();
    
    if exists is None:
        c.execute("INSERT INTO design_guide_temp(userid, data) VALUES(?,?)", (userid, data))
    else:
        if userid is None:
            c.execute("UPDATE design_guide_temp SET data=? WHERE userid is NULL", (data,))
        else:
            c.execute("UPDATE design_guide_temp SET data=? WHERE userid=?", (data, userid))
    
    conn.commit()
    conn.close()
    return

def getDesignGuideTempData(userid):
    conn = sql.connect(sql_path)
    c = conn.cursor()
    
    if userid is None:
        c.execute("SELECT data FROM design_guide_temp WHERE userid is NULL")
        user_email = "null"
    else:
        c.execute("SELECT data FROM design_guide_temp WHERE userid=?", (userid,))
        user_email = get_email(userid)
        
    dataOut = c.fetchone()
    dataOut = json.loads( dataOut[0] )
    dataOut["email"] = user_email
    
    conn.close()
    return dataOut

def getDesignGuideData(userid, project_name=None):
    conn = sql.connect(sql_path)
    c = conn.cursor()
    
    if userid is None:
        c.execute("SELECT data FROM design_guide WHERE userid is NULL")
        user_email = "null"
    else:
        c.execute("SELECT data FROM design_guide WHERE userid=? AND project_name=?", (userid,project_name))
        user_email = get_email(userid)
        
    dataOut = c.fetchone()
    dataOut = json.loads( dataOut[0] )
    dataOut["email"] = user_email
    
    conn.close()
    return dataOut

def getImgData(userid, rowid, projectname):
    con = sql.connect(sql_path)
    cur = con.cursor()
    
    cur.execute("SELECT data FROM graph WHERE project_name=? AND rowid=? AND userid=?", (projectname,rowid,userid,))
    row = cur.fetchone();
    con.close()
    
    return row[0]


def getToolsReportData(user_id, projectname, table, rowid=None):
    from pyhelp import genCombinations as genC

    con = sql.connect(sql_path)
    cur = con.cursor()
    
    user_email = get_email(user_id)
    dataOut = {'img':None, 'row':None, 'template':None}
    
    row = None
    
    if table=="graph":
        # do nothing, or display the graph
        cur.execute("SELECT data FROM graph WHERE project_name=? AND rowid=? AND userid=?", (projectname,rowid,user_id,))
        row = cur.fetchone();
        con.close()
        
        if row is not None:
            row = json.loads( row[0] )
            
        dataOut["template"] = "static/partials/webpage_reports/templates/graph_report_template.html"
        imgData = row["img"]
        row.pop("img")      # no need for two copies of the image data
        
        dataOut["row"] = row["data"]
        dataOut["row"]["email"] = user_email
        dataOut["img"] = imgData
        return dataOut
    
    if table=="powersize":
        cur.execute("SELECT data FROM powersize WHERE userid=? AND project_name=?", (user_id,projectname))
        row = cur.fetchone();
    else:   #samplesize
        cur.execute("SELECT data FROM samplesize WHERE userid=? AND project_name=?", (user_id,projectname))
        row = cur.fetchone();
        
    if row is not None:
        row = json.loads( row[0] );
        # note that this returns the second argument ([1]) of the genCombinations function
        row["combinations"] = genC.genCombinations( row["treatmentsTotal"] )[1]
    
    # Load power plot image
    cur.execute("SELECT data FROM graph WHERE userid=? AND project_name=? AND name=?", (user_id,projectname,'Power Plot'))
    img = cur.fetchone();
    con.close()
    
    '''
    from base64 import b64encode
    if img is not None:
        img = img[0]
    else:
        dir_path  = "ShinyApps/user_files/plots";
        plot_path = os.path.join(dir_path, "tmp" + '%s' + ".png") % user_id

        with open("ShinyApps/user_files/plots/placeholder.png", "rb") as image_file:
            img = b64encode(image_file.read())
        
        img = img.decode()
        img = 'data:image/png;base64,' + img
    dataOut["img"] = img
    #'''
    
    dataOut["row"] = row
    dataOut["row"]["email"] = user_email
    dataOut["template"] = "static/partials/webpage_reports/templates/tools_report_template.html"
    return dataOut
