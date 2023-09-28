# Flask `saveUserData` endpoint

The data is sent via JSON from AngularJS to Python at the `saveUserData` endpoint (shown below). Depending on the "tool" (power, sample, or graph), we then dump the data to functions in `pyhelp/app_database.py`.

```python
@app.route('/saveUserData', methods = ['POST'])
@uid_match_required
def saveUserData():
    data        = request.get_json();
    user_id     = data['user_id']
    projectname = data['project']
    toolType    = None

    if "tool" in data:
        toolType = data["tool"]
    
    #json.dumps(data) converts dict objects to JSON
    if toolType == "samplesize":
        app_database.saveSample(user_id, projectname, json.dumps(data))
    elif toolType == "power":
        app_database.savePower(user_id, projectname, json.dumps(data))
    else:
        plotname = data['plotname']
        app_database.saveGraph(user_id, projectname, json.dumps(data["data"]), plotname)
    
    return 'OK'
```

## Format

All the data is formatted as JSON (human-readable ASCII data). 


## saveSample

Taking the *userid* and *project_name* as variable inputs, we save the data to the database `samplesize` table. If there is no sample size data associated with the given project name, then we need to create a row (**INSERT**). If data already exists, we will overwrite it (**UPDATE**).

```python
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
```

## savePower

We have the same steps here as above, the only change is that we are saving to the `powersize` table. 

(Note: this code could be condensed with the above code to make the table name variable.)

```python
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
```

## saveGraph

In the code below, we need *userid* and *project_name*, but we also name the plot based on where is came from, e.g. "Power Plot", "Sim Plot for 1-Way ANOVA", etc. This name is generated in Javascript and passed here.

```python
def saveGraph(userid, project_name, data, plotname):
    conn = sql.connect(sql_path)
    c    = conn.cursor()
    
    # need userid and project name
    # need to know if updating/replacing existing graph or creating a new one
    c.execute("INSERT INTO graph(name, userid, project_name, data) VALUES(?,?,?,?)", (plotname, userid, project_name, data))
    
    conn.commit()
    conn.close()
    return
```
