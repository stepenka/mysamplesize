
@echo off

REM --- Input the location of GTK\bin to set the path. Otherwise, pdf creation fails.

REM set PATH=D:\Tempest\SVNHost\NIH_web\trunk\GTK\bin;%PATH%

set PATH=D:\Programs\GTK3-Runtime Win64\bin;%PATH%


..\..\..\trunk\venv\Scripts\activate

cmd /k
