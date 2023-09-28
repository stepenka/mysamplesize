# Visualization

I like to use [DB Browser for SQLite](https://sqlitebrowser.org/) to help navigate and inspect the database. 

# Install DB Browser for SQLite
The DB Browser can be found at link https://sqlitebrowser.org/dl/ for download. Once download completed, you can double-click the program to install.  

# View database

Click the DB Browser icon open SB Browser (can be found, most time, in `C:\Program Files\DB Browser for SQLite\` if a shortcut does not exist.). To choose a database, click File > Open Database and choose a database, e.g. database.sqlite in app\ShineyApps\user_files\, to view.

![](img/browser_open.PNG)

# Navigate DB Browser
## Top-level data
After opening a database, we can view the top-level data:

![](img/browser_top.PNG)


## Specific table data
We can also dive into the data for a specific table (`graphs` table shown below, for example)

![](img/browser_graph.PNG)

# Edit data

You can also use DB Browser to directly edit data (with the caveat that it is not `FOREIGN_KEY` data. See makeDB.py for some information).

![](img/browser_edit.PNG)

