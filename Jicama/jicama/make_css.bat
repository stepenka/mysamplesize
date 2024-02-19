@echo off

REM -----------------------------------------
REM     To use, you need:
REM         >> pip install libscss
REM -----------------------------------------

set REL_DIR=.

pysassc %REL_DIR%/scss/main.scss %REL_DIR%/app/static/css/main.css