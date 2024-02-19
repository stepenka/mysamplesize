#
# Remove a user from database by email address
#
DBNAME = 'myDB.sqlite';
import sqlite3 as sql
conn = sql.connect(DBNAME)
conn.execute('pragma foreign_keys=OFF')
c = conn.cursor()

def removeUserById(user_id):
    if user_id is not None:
        user_id = user_id[0]
        c.execute("DELETE FROM design_guide WHERE userid=?", (user_id,))
        c.execute("DELETE FROM samplesize WHERE userid=?", (user_id,))
        c.execute("DELETE FROM powersize WHERE userid=?", (user_id,))
        c.execute("DELETE FROM graph WHERE userid=?", (user_id,))
        
        #the above are tied to the PROJECT table
        c.execute("DELETE FROM project WHERE userid=?", (user_id,))
        
        # Lastly, delete from USERS table
        c.execute("DELETE FROM users WHERE userid=?", (user_id,))
        
        print("      USER DELETED FROM DATABASE")
    else:
        print("      USER NOT FOUND")


def removeUserByEmail(email):
    c.execute("SELECT userid FROM users WHERE email=?", (email,))
    user_id = c.fetchone()
    removeUserById(user_id);

conn.commit()
conn.close()