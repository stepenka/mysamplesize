# sqlite3

SQLite is a C library that provides a lightweight disk-based database. The Python database interface we use to interface with SQLite is called `sqlite3`. 

https://docs.python.org/2/library/sqlite3.html


### Installation

`pip install sqlite3`


____________________
## General Concepts

Visually, a database is similar to an Excel file in that databases contain **tables** like Excel has sheets. These tables can have related data (e.g. Auth0 user id) but their general purpose is to contain separate portions of information.

For MySampleSize, we have the following tables:

|  Table Name   |    Purpose |
|---------------|------------|
| ` users`      | Contains overarching information about Auth0 user id, user email, and Stripe customer id
| `project`     | Contains all the top-level projects for each user. For each user, we require the project names to be unique
|  `samplesize` | Contains project information related to sample size data. Each field in the table is uniquely associated with a user id and project name from the `project` table.
| `powersize` | Contains project information related to power calculation data. 
| `graph` | Contains graph data from power plots, simulations, or data analysis. 


Each user *project* has subprojects, that is, data from the `graph`, `powersize`, and/or `samplesize` tables that "belong" to a project, associated by project name from the `project` table.

### Unique Association

The database (or the table) is created through `ShinyApps/user_files/makeDB.py`. The database must have uniqueness and associate the subprojects with a parent project. To achieve this, a database is created with PRIMARY KEY and FOREIGN KEY. It is demonstrated in below, a multiple tables is created. In the `users` table, the *userid* field is set to be a PRIMARY KEY. This allows the next table, `project` to use *userid* as something that must be associated with the same field on the `users` table.
 
![](img/makeDB.PNG)

____________________



## Flow

The general flow for modifying a database is as follows:

1. Make a connection
2. Create a cursor object
3. Use the cursor object to execute SQL commands
4. Save (commit) the changes
5. Close the connection

## Make a connection

```python
import sqlite3
conn = sqlite3.connect('example.db')
```

## Create a cursor object

```python
cur = conn.cursor()
```

## Execute SQL commands

### Create a table
```python
cur.execute(''' CREATE TABLE users(
    userid      TEXT NOT NULL, 
    email       TEXT,
    customer_id TEXT,
    PRIMARY KEY (userid),
    UNIQUE(userid)
)''')
```

### Add data to table

```python
cur.execute("INSERT INTO users(userid,email,customer_id) VALUES(?,?,?)", 
    (userID, 'info@tempest-tech.com','cus_stripe_key')
)
```

## Save (commit) the changes

```python
conn.commit()
```

## Close the connection

This will close the connection to the database, so make sure any changes you want are committed first!

```python
conn.close()
```
