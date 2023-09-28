@REM To view webdoc in the folder DACurr\documentation\webdoc
@echo off

@start cmd /C run "C:\Program Files\Mozilla Firefox\firefox" -new-window localhost:8000
@c:\windows\system32\timeout /T 10
@python -m http.server

@echo on
