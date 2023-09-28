@echo off

REM -----------------------------------------------------------------------
REM     Set the DEPLOY_FOLDER variable to whatever system folder you want.
REM     Right now, it creates a folder called "deployment" one level up
REM     from the current folder.
REM -----------------------------------------------------------------------

set DEPLOY_FOLDER=./
set REPO=svn://shakespeare/NIDA_web

svn export %REPO%/branches/standalone_TTcalculator %DEPLOY_FOLDER%/alpha --force
rm -rf %DEPLOY_FOLDER%\alpha\.ebextensions
rm -rf %DEPLOY_FOLDER%\alpha\.elasticbeanstalk

REM ----- we must remove the Elastic Beanstalk folders from the /alpha/ folder 

REM svn export %REPO%/branches/eggplant/app %DEPLOY_FOLDER% --force
