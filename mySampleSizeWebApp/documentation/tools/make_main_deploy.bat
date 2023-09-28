@echo off

REM -----------------------------------------------------------------------
REM     Set the DEPLOY_FOLDER variable to whatever system folder you want.
REM     Right now, it creates a folder called "deployment" one level up
REM     from the current folder.
REM -----------------------------------------------------------------------

set REPO=svn://shakespeare/NIDA_web
set BRANCHNAME=fennel

svn export %REPO%/branches/%BRANCHNAME%/app ./ --force
:: To export older versio, e.g. 361:
:: svn export -r 361 %REPO%/branches/%BRANCHNAME%/app ./ --force
 
@echo Removing some files and folders...

rm -rf static/js/backups
rm -rf static/js/node_modules
rm -rf static/js/nvd3
