#
# 
#
import sqlite3 as sql
import json

DBNAME = 'database.sqlite';
conn = sql.connect(DBNAME)
c = conn.cursor()

c.execute("SELECT rowid, data FROM graph")
row = c.fetchall()

for ii in range( len(row) ):
    imgData = row[ii][1]
    rowid   = row[ii][0]
    
    JSON_data = {"data":{}, "img": [imgData]}
    
    c.execute("UPDATE graph SET data=? WHERE rowid=?", (json.dumps(JSON_data), rowid,))

conn.commit()
conn.close()