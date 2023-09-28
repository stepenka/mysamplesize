import requests

from app_context import app_warn, auth0, json

def get_access_token():
    #----------------------------------
    # GET TOKEN
    #----------------------------------
    data = {"grant_type": "client_credentials",
               "client_id": auth0.client_id,
               "client_secret": auth0.client_secret,
               "audience": "https://webmaster.auth0.com/api/v2/"
    };
    payload = json.dumps(data)
    headers = { 'content-type': "application/json" }
    response = requests.post('https://webmaster.auth0.com/oauth/token', headers=headers, data=payload)
    
    if response.status_code == requests.codes.ok:
        resp = response.json()  # actually a dict() response
        auth0.access_token = resp["access_token"]
    else:
        raise Exception('Did not obtain access token.')
    
    return;
    
def find_user_by_id(user_id):
    get_access_token()

    params = {
        'include_fields': 'true',
        'search_engine': 'v3'
    }
    headers = {
        'Authorization': 'Bearer ' + auth0.access_token,
        'Content-Type': 'application/json',
    }
    response = requests.get('https://webmaster.auth0.com/api/v2/users/auth0|'+user_id, headers=headers)
    #if response.status_code == requests.codes.ok:
    
    return response.json()

def find_user_by_email(email):
    # Note: email must be lowercase
    
    email = email.lower()
    
    #app_warn('GETTING ACCESS TOKEN')
    get_access_token()
    
    params = {
        'include_fields': 'true',
        'email': email,
        'search_engine': 'v3'
    }
    headers = {
        'Authorization': 'Bearer ' + auth0.access_token,
        'Content-Type': 'application/json',
    }
    #app_warn('SENDING RESPONSE')
    response = requests.get('https://webmaster.auth0.com/api/v2/users-by-email', headers=headers, params=params)
    #if response.status_code == requests.codes.ok:
    
    return response.json()

def create_user(name, email, password, customer_id):

    email = email.lower()
    get_access_token();

    #----------------------------------
    # CREATE USER
    #----------------------------------
    data = {
        "connection": "DesignAssist-Login",
        "email": email,
        "password": password,
        "name": name,
        "user_metadata": {
            "customer_id": customer_id
        },
        "email_verified": False,
        "verify_email": True,
        "app_metadata": {
            "authorization": {
                "groups": []
            },
            "signed_up": True       # don't delete this
        },
    };
    
    headers = {
        'Authorization': 'Bearer ' + auth0.access_token,
        'Content-Type': 'application/json',
    }

    data = json.dumps( data )

    response = requests.post('https://webmaster.auth0.com/api/v2/users', headers=headers, data=data)
    
    # We need to check for response errors here, such as password requirements
    
    return response.json()
    
#
# Allow a user to change their password from within account page
#
def change_password(user_id, new_password):
    get_access_token()
    
    headers = {
        'Authorization': 'Bearer ' + auth0.access_token,
        'Content-Type': 'application/json',
    }

    data = {
        "password": new_password, 
        "connection": "DesignAssist-Login",
        "search_engine": 'v3'
    }
    data = json.dumps( data )
    
    response = requests.patch('https://webmaster.auth0.com/api/v2/users/auth0|'+user_id, headers=headers, data=data)
    
    return response.json()
