@echo off

REM ------------------------------------------------------------------------------------------
REM     The purpose of this file is to download the database directly from the AWS server 
REM     using the command line instead of the WinSCP interface. The reason we might need 
REM     this is to periodically check the database and recover from any potential errors.
REM
REM     (Note: replace with the location of your .ppk credentials file)
REM 
REM     If there ever is a "timed out" error, check the EC2 inbound rules to allow port 22 access
REM ------------------------------------------------------------------------------------------

SET APP_LOC=/opt/python/current/app

REM  With PSCP, we can pass the password. With SCP, a user interface for password entry is required.
REM  Note that the key file needs its extension here (and not with the SCP command).

SET USERCONN_live=ec2-user@52.43.146.102
SET USERCONN_beta=ec2-user@52.10.181.165

SET USERCONN=%USERCONN_live%
:: Location path may differ on the PC
SET PPK_LOC=D:\Tempest\SVNHost\NIDA_web\documentation\access
REM SET PPK_LOC=C:\Users\kholmbeck\.ssh

pscp -v -i %PPK_LOC%\nih.ppk -pw tempest208 %USERCONN%:%APP_LOC%/ShinyApps/user_files/database.sqlite ./db_download.sqlite


REM pscp -i C:\Users\kholmbeck\.ssh\nih.ppk -pw tempest208 %USERCONN%:/var/log/httpd/error_log ./error_log
