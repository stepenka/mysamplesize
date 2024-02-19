from flask import Flask, render_template, request, send_file, send_from_directory, make_response
from flask import jsonify, json, url_for, redirect

import re               # regular expressions
import os

import numpy

# set to False unless doing calculation testing
DEBUG_FLAG = False

from datetime import datetime

# configuration of our app
application = Flask(__name__,static_folder='static',template_folder='')
app = application
app.secret_key = b"\x9c\x06\xbai9\xe0*\x01\xdf\xc5\xea\xf6\x96~\xad'Z\x10\x88*\x9d`\xd8\x1f";

# this is a helper function to be used when comparing test type strings on the Python side
def getTestType(testType):
    # the strings must correspond with those in designguideService.js
    oneT    = (testType == "T-Test - One Sample");
    twoT    = (testType == "T-Test - Two Sample");
    pairedT = (testType == "Paired T-Test");
    oneAOV  = (testType == "1-Way ANOVA");
    twoAOV  = (testType == "2-Way ANOVA");
    multAOV = (testType == "Multi-Way ANOVA");
    rmPS1   = (testType == "Repeated Measures ANOVA");
    rmCS1   = (testType == "Crossover");
    
    retval = {'oneT':oneT, 'twoT':twoT, 'pairedT':pairedT, 'oneAOV':oneAOV, 'twoAOV':twoAOV, 'multAOV':multAOV, 'rmPS1':rmPS1, 'rmCS1':rmCS1}
    
    return retval
    
def app_warn(str):
    return app.logger.warn( str );

from flask_mail import Mail, Message

app.config.update(
    #EMAIL SETTINGS
    MAIL_DEBUG      = True,
    MAIL_SERVER     = 'smtp.gmail.com',
    MAIL_PORT       = 465,
    MAIL_USE_SSL    = True,
    MAIL_USERNAME   = 'tempest.tech.helper@gmail.com',
    MAIL_PASSWORD   = 'Tempest506!'
)
mail = Mail(app)


#----------------------------------------------------
# Auth0 stuff
#----------------------------------------------------
from flask import session   # I put this here to indicate it's only used for Auth0 stuff
from authlib.flask.client import OAuth
oauth = OAuth(app)

auth0 = oauth.register(
    'auth0',
    client_id='UPFaWcmXQaUGHmx9XRDHdi3UGGY5gkbu',
    client_secret='vjYIaDdQ3uteRBZRQtiMH2DB0zFdKlx-70GBPxyAdu0mLgAZH588ZC93lSaYUwkh',
    api_base_url='https://webmaster.auth0.com',
    access_token_url='https://webmaster.auth0.com/oauth/token',
    authorize_url='https://webmaster.auth0.com/authorize/',
    client_kwargs={
        'scope': 'openid profile',
    },
)

auth0_constants={
    'JWT_PAYLOAD': 'jwt_payload',
    'PROFILE_KEY': 'profile'
}

#----------------------------------------------------
# File upload stuff
#----------------------------------------------------
from werkzeug.utils import secure_filename

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt','csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

