from app_context import *

from flask_weasyprint import HTML, render_pdf   #create PDF for tools output

from statsmodels.tools.sm_exceptions import (ConvergenceWarning, convergence_doc)
import warnings
warnings.simplefilter('error', ConvergenceWarning)

from pyhelp import app_database     # separate file for handling sql database calls
from pyhelp import stripe_payments as s_pay
from pyhelp import auth0_controller
from pyhelp import powerCalc
from pyhelp import html5routes
from pyhelp import genCombinations as genC

# Bundle for combining and/or minifying Javascripts --
from flask_assets import Environment, Bundle

assets = Environment(app)
css_bundle = Bundle(
    "css/bootstrap.min.css",
    "css/font-awesome.min.css",
    "css/main.css"
)
js_post_bundle = Bundle(
    Bundle (                        # base files
        "../app.js",
        "../app.routes.js",
        "rootController.js",
    ), Bundle(                      # support files
        "module_modals/modals.designGuide.js",
        "module_modals/custom_directives.js",
        "module_modals/keyword-directives.js",
    ), Bundle (                     # uiTour
        "js/node_modules_bare/angular-sanitize/angular-sanitize.js",
        "js/node_modules_bare/mousetrap/mousetrap.js",
        "js/node_modules_bare/angular-hotkeys/hotkeys.js",
        "js/node_modules_bare/hone/hone.js",
        "js/node_modules_bare/tether/tether.js",
        "js/node_modules_bare/angular-scroll/angular-scroll.js",
        "js/node_modules_bare/angular-bind-html-compile/angular-bind-html-compile.js",
        
        "js/node_modules_bare/angular-ui-tour/angular-ui-tour.js",
    ), Bundle(                      # saving SVGs
        "js/ie_polyfill/canvg.js",                  # all these extra ones are for working with IE
        "js/ie_polyfill/rgbcolor.js",
        "js/ie_polyfill/ie_obj_assign.js",
    ), Bundle(                      # reports
        "module_save/saveSvgAsPng.js",
        "module_save/saveToolsController.js",
        "module_save/plotsService.js",
    ), Bundle(                      # design guide
        "module_designguide/designguideService.js",
        "module_designguide/designguideController.js",
        "module_walkthrough/designGuideWalkthroughController.js",
    ), Bundle(                      # authentication, account, user projects
        "module_auth/authService.js",
        "module_auth/stripeService.js",
        "module_auth/stripeController.js",
        "module_auth/myAccountController.js",
        "module_auth/userProjectsController.js",
    ), Bundle(                      # help pages
        "module_help/helpController.js",
        "module_help/helpPlotsController.js",
        "module_help/helpEffectController.js",
        "module_help/contactFormController.js",
    ), Bundle(                      # reports
        "module_reports/reportsController.js",
        "module_reports/reportSupplementController.js",
    ), Bundle(                      # tools
        "module_tools/calculatorService.js",
        "module_tools/toolsController.js",
        "module_tools/powerPlotsController.js",
        "module_tools/simPlotCtrl.js",
        "module_tools/rngController.js",
        "module_tools/analysisController.js",
    )
);
assets.register('js_post_min', js_post_bundle,
                filters="jsmin",
                output='js/post_packed.js')
assets.register('css_min', css_bundle,
                filters="cssmin",
                output='css/packed.css')
assets.manifest = False
assets.cache = False


# isAuthUser(user_id) is a standalone endpoint to test whether the input "user_id"
# matches the session captured from Auth0
PASS_AUTH = True    # should be set to False (set to True for testing/using without authentication on localhost. Setting True is also what the previous version works like)
from functools import wraps
def uid_match_required(f):
    @wraps(f)
    def decorated_view(*args, **kwargs):
        authDict= get_auth()
        isAuth  = False
        
        if authDict['authenticated']:
            if request.method == 'GET':
                uid_arg = request.args.get('user_id')
            else:
                uid_arg = request.get_json()["user_id"]
            
            uid     = authDict["user_info"]["user_id"]
            uid     = re.sub("auth0\|", "", uid)
            uid_arg = re.sub("auth0\|", "", uid_arg)
            isAuth  = (uid == uid_arg)
        
        if not PASS_AUTH and not isAuth:
            return 'You do not have permission to access this endpoint'
        
        return f(*args, **kwargs)
    return decorated_view
    
def auth_required(f):
    @wraps(f)
    def decorated_view(*args, **kwargs):
        authDict= get_auth()
        isAuth  = authDict['authenticated']

        if not PASS_AUTH and not isAuth:
            return 'You do not have permission to access this endpoint'
        
        return f(*args, **kwargs)
    return decorated_view

#---------------------------------------------------------------------------------------

# THIS IS THE MAIN ENTRYPOINT TO ALL ANGULARJS PAGES
@app.route('/<path:filename>')
def npm_start(filename):
    return send_from_directory('.', filename)

@app.route('/EULA')
def EULA():
    return render_template('static/module_modals/modal_templates/EULA_content.html')

@app.route('/sitemap.xml')
def sitemap():
    temp = render_template('static/partials/webpage_core/sitemap.xml');
    resp = make_response(temp)
    resp.headers['Content-Type'] = 'application/xml'
    return resp

@app.route('/robots.txt')
def robots():
    return send_from_directory('.', 'static/partials/webpage_core/robots.txt')

@app.route('/get_coupon', methods=['GET'])
def get_coupon():
    coupon_id = request.args.get('id')
    
    app_warn(coupon_id)
    
    info = {"error": True, "message": 'Coupon not found'}
    if coupon_id:
        info = s_pay.get_coupon(coupon_id)

    return jsonify(info)

@app.route('/get_stripe_account_info', methods=['GET'])
@uid_match_required
def get_stripe_account_info():

    user_id     = request.args.get('user_id')
    customer_id = None
    
    try:
        customer_id = app_database.get_customer_id(user_id)
    except Exception as e:
        app_warn("get_stripe_account_info error");
        app_warn(e)
        app_warn("User with user_id %s not found" % (user_id))
    
    if customer_id is None:
        app_warn( 'Stripe customer not found.' );
        # must throw an error
        retval = {"error": True, "message": 'Customer not found. Please contact us.'}

    else:
        retval = s_pay.get_customer_info( customer_id )
        retval["auth0"] = auth0_controller.find_user_by_id( user_id )
        
    return jsonify(retval)

@app.route('/get_stripe_plans', methods=['GET'])
def get_stripe_plans():
    # defined in pyhelp/stripe_payments.py
    return jsonify([
        s_pay.stripe.Plan.retrieve(s_pay.STRIPE_PLANS["monthly"]), # monthly
        s_pay.stripe.Plan.retrieve(s_pay.STRIPE_PLANS["yearly"]),  # yearly
        s_pay.stripe.Plan.retrieve(s_pay.STRIPE_PLANS["group_yearly"])  # group yearly
    ])
    
@app.route('/cancel_subscription', methods=['GET'])
@uid_match_required
def cancel_subscription():
    user_id     = request.args.get('user_id')
    customer_id = app_database.get_customer_id(user_id)
    retval      = s_pay.cancel_subscription( customer_id )
    return jsonify( retval )
    
@app.route('/stripe-pay-new-account', methods=['POST'])
def payment_and_account_creation():
    data            = request.get_json()
    stripe_token    = data["token"]
    user_email      = data["email"].lower()
    user_password   = data["password"]
    
    # First, find existing user in auth0. If exists, abort. They must log into their account
    # using the associated email and configure payment settings
    tmp = auth0_controller.find_user_by_email( user_email )

    retval = {"error": False, "message": 'User does not exist'}
    
    if tmp:
        retval["error"] = True
        retval["message"] = "User already exists. Please login to your account."
        
        return jsonify(retval)

    if data["license_code"]:
        resp = s_pay.create_group_customer(user_email, data["license_code"])
    else:
        token_id = None
        if stripe_token:
            token_id = stripe_token["id"]

        # if user is new, create a Stripe customer and subscription for them
        resp = s_pay.create_and_charge_customer(token_id, user_email, data["selected_plan_id"], data["quantity"])
        
    resp2 = resp
    #app_warn( resp );
    
    if resp["error"] == False:
        # create a user in Auth0
        name        = data["name"] + ', ' + data["affiliation"]
        customer_id = resp["message"]["customer"]
        
        message     = "Your purchase has been processed and your account created!"
        resp        = auth0_controller.create_user(name, user_email, user_password, customer_id)
        
        # how to handle an error response?
        app_warn( resp )
        
        # put user into database
        date = str(datetime.now())
        app_database.makeNewUser(resp["user_id"], user_email, customer_id, date)
    else:
        # an error ocurred
        app_warn( resp["message"] )
        
    return jsonify(resp2)
    
# THIS NEEDS TO BE CHECKED; I don't think an actual payment is made
@app.route('/stripe-pay-existing-customer', methods=['POST'])
def payment():
    data            = request.get_json()
    stripe_token    = data["token"]
    user_email      = data["email"]
    customer_id     = None
    
    if "customer_id" in data:
        customer_id = data["customer_id"]
    
    if data["license_code"]:
        try:
            if customer_id:
                resp = s_pay.update_as_group_customer(customer_id, data["license_code"])
            else:
                userData = get_auth()
                user_id = userData["user_info"]["user_id"]
                
                resp = s_pay.create_group_customer(user_email, data["license_code"])
                print(resp)
                customer_id = resp["message"]["customer"]
                app_database.updateCustomerId(user_id, user_email, customer_id)
                
        except Exception as e:
            print(e)
            resp = {"error": str(e)}
    else:
        trialing = False    # this will prevent the existing customer from using the trial period
        
        resp = s_pay.update_customer(customer_id, stripe_token["id"])
        
        # if user is new, create a Stripe customer and subscription for them
        resp = s_pay.create_subscription(customer_id, data["selected_plan_id"], data["quantity"], trialing);
        
        #resp = s_pay.create_and_charge_customer(stripe_token["id"], user_email, data["selected_plan_id"], data["quantity"])
        
    resp2 = resp
    app_warn( resp );
    
    return jsonify(resp2)    
    
@app.route('/stripe-update-pay', methods=['POST'])
def payment_update():
    data            = request.get_json()
    stripe_token    = data["token"]
    user_id         = data["customer_id"]
    
    customer_id = app_database.get_customer_id(user_id)
    
    # update the customer with payment source information
    resp = s_pay.update_customer(customer_id, stripe_token["id"])
    
    return jsonify(resp)


@app.route('/change_password', methods=['POST'])
@uid_match_required
def change_password():
    data = request.get_json()
    resp = auth0_controller.change_password(data["user_id"], data["new_password"])
    return jsonify(resp)


@app.route("/contact", methods=['POST'])
def contact():
    data    = request.get_json()
    sender  = data['name']
    email   = data['email']
    phone   = data['phone']
    message = data['message']
    
    msg     = Message('MySampleSize - Contact Form', sender=email, recipients=['webmaster@tempest-tech.com'])
    msg.body= '\nName: ' + sender + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\n' + message
    
    mail.send(msg)
    
    return jsonify(result="Your message has been sent.")
    
#------------------ LaTeX download from Supplemental Form  ------------------#

@app.route('/compute_latex', methods=['POST'])
@auth_required
def compute_latex():
    from pyhelp import makeLatex
    
    data = request.get_json();
    file = makeLatex.makeLatex( data )

    return jsonify(result=file+".tex")
    
    report = doc.generate_tex(path)
    report2 = doc.generate_pdf(path)

    file = request.files['upload_design']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        #rec = Photo(filename=filename, user=g.user.id) it will be possible to save to each users individual folder in the future, make sure this changes
        file.save(os.path.join(UPLOAD_FOLDER, 'study_design_pic.png'))
        
    #return render_template('arrive_formANS.html', study3 = study3)
    return jsonify(result="file made")

@app.route('/download=<filename>', methods=['GET', 'POST'])
def download(filename):
    return send_file("./static/img/arrive/"+filename, attachment_filename=filename, as_attachment=True)

#--------------------------------------------------------#


#------------------ Database for Shiny/Python ------------------#
@app.route('/newproject', methods = ['GET'])
@uid_match_required
def newproject():
    user_id  = request.args.get('user_id')
    tempname = request.args.get('project')
    date     = str(datetime.now())

    app_database.makeNewProject(user_id, tempname, date)

    return sqlprojects_by_id(user_id)

@app.route('/deleteproject', methods = ['GET'])
@uid_match_required
def deleteproject():
    user_id     = request.args.get('user_id')
    projectname = request.args.get('project')

    app_database.deleteProject(user_id, projectname);
    
    return sqlprojects_by_id(user_id)

@app.route('/deleteSubProject', methods = ['POST'])
@uid_match_required
def deleteSubProject():
    data        = request.get_json()
    user_id     = data['user_id']
    projectname = data['project']
    rowid       = data['rowid']
    table       = data['table']
    
    app_database.deleteSubProject(user_id, projectname, table, rowid);
    return sqlprojects_by_id(user_id)

@app.route('/renameproject', methods = ['GET'])
@uid_match_required
def renameproject():
    user_id     = request.args.get('user_id')
    projectname = request.args.get('project')
    newname     = request.args.get('newname')

    app_database.renameProject(user_id, projectname, newname);
    
    return sqlprojects_by_id(user_id)

def sqlprojects_by_id(user_id):
    projList = app_database.getProjects(user_id)
    projDict = []
    ndx      = 0
    for projName in projList["projects"]:
        subProjects = app_database.getSubProjects(user_id, projName)
        
        tmp         = {}
        tmp["subs"] = subProjects
        tmp["name"] = projName
        tmp["created"] = projList["times"][ndx];
        projDict.append( tmp )
        
        ndx = ndx + 1;
    
    return json.dumps(projDict)   # all projects, subprojects, unique row IDs  
    
@app.route('/sqlprojects', methods = ['GET'])
@uid_match_required
def sqlprojects():
    user_id  = request.args.get('user_id')
    
    return sqlprojects_by_id(user_id)


#-----------------------------------------------------
@app.route('/getDGdata', methods=['GET','POST'])
@uid_match_required
def getDGdata():
    user_id     = request.args.get('user_id')
    projectname = request.args.get('project')
    table       = request.args.get('table')
    rowid       = request.args.get('rowid')
    dataOut     = app_database.getDesignGuideData(user_id, projectname)
    
    return json.dumps(dataOut)

def toolsTemplate(user_id, projectname, table, rowid):
    if projectname is "undefined":
        projectname = ''
    
    if table == "design_guide":
        dataOut = app_database.getDesignGuideData(user_id, projectname)
        template = design_report_template_input_data(dataOut)
    else:
        dataOut = app_database.getToolsReportData(user_id, projectname, table, rowid)
        
        rowData = dataOut["row"]
        rowData["isTest"] = getTestType( rowData["test"] )

        template = render_template(dataOut["template"], row=rowData, img=dataOut["img"],  projectname=projectname)
    
    return template

@app.route('/toolsPDF', methods = ['GET'])
@uid_match_required
def toolsPDF():
    user_id     = request.args.get('user_id')
    projectname = request.args.get('project')
    table       = request.args.get('table')
    rowid       = request.args.get('rowid')
    
    template    = toolsTemplate(user_id, projectname, table, rowid)
    pdf         = HTML( string=template )
    
    return render_pdf(pdf)

@app.route('/toolsHTML', methods = ['GET'])
@uid_match_required
def toolsHTML():
    data        = request.get_json();
    user_id     = request.args.get('user_id')
    projectname = request.args.get('project')
    table       = request.args.get('table')
    rowid       = request.args.get('rowid')
    
    return toolsTemplate(user_id, projectname, table, rowid)
#--------------------------------------------------------#



#--------------------------------------------------------#
# Tools Calculations
#--------------------------------------------------------#
@app.route('/calculate', methods = ['POST'])
@auth_required
def calculate():
    data = request.get_json();
    
    testType= data["test"]
    isTest = getTestType(testType)
    
    # tmp = {'value': [0,0,0], 'msg': 'All is well', 'error': False}
    tmp = {'value': [0,0,0], 'msg': 'All is well', 'error': False, 'valueDunnett': [], 'valueTukey': []}
    
    # note: currently working for calculating POWER of 2-way and multi-way ANOVA. Need to calc sampsize next.
    
    import statsmodels.stats.power as sm
    transFn = numpy.ceil
    
    pow     = None
    sampsize= None
    sigLevel= data["sig"]
    
    if data["tool"] == "power":
        pow      = None
        sampsize = data["samplesize"]
        transFn  = lambda val: numpy.round(val, 3)       # round power values to 3 digits
    if data["tool"] == "samplesize":
        sampsize = None
        pow      = data["pow"]
    
    retval = 0
    
    # Commenting the try and re-indent if blocks for debuging
    try:
        if isTest["oneT"] | isTest["pairedT"]:
            retval = sm.TTestPower().solve_power(effect_size=data["es"], nobs=sampsize, alpha=sigLevel, power=pow)
            tmp["value"][0] = retval
            
        elif isTest["twoT"]:
            retval = sm.TTestIndPower().solve_power(effect_size=data["es"], nobs1=sampsize, alpha=sigLevel, power=pow)
            tmp["value"][0] = retval
            
        elif isTest["oneAOV"]:
            tmp = powerCalc.oneAOV_solver(effectSize=data["es"], sigLevel=sigLevel, nGroups=data["groups"], sampSize=sampsize, powSize=pow)
            
        elif isTest["twoAOV"]:
            LS  = numpy.array( data["lambda"], float )
            df1 = numpy.array([data["dfM"], data["dfS"], data["dfI"]], float)
            dataK = data["k"]
            tmp = powerCalc.twoAOV_solver(df1, LS, sigLevel, dataK, pow, data["df2"])
        
        elif not isTest["multAOV"]:
            df1  = numpy.array(data["df1"], float)
            df2  = numpy.array(data["df2"], float)
            LS   = numpy.array(data["lambda"], float)
            dataK= numpy.array(data["k"], float)
            
            if isTest["rmCS1"]:
                retval = powerCalc.rmCS1_solver(sigLevel, df1, LS, dataK, pow, df2)
                
                if pow is None:
                    tmp["value"][0] = retval
                else:
                    tmp = retval

            elif isTest["rmPS1"]:
                retval = powerCalc.rmPS1_solver(sigLevel, df1, LS, dataK, pow, df2)
                
                if pow is None:
                    tmp["value"] = retval
                else:
                    tmp = retval

        else:   # Multi-Way ANOVA
            df1  = numpy.array(data["df1"], float)
            LS   = numpy.array(data["lambda"], float)
            df2  = numpy.array(data["df2"], float)
            dataK= numpy.array(data["k"], float)
            tmp = powerCalc.AOVM_solver(sigLevel, dataK, df1, LS, pow, df2)
            
    # Commenting the excepts for debuging
    except ConvergenceWarning as e:
        tmp["error"] = True
        tmp["msg"] = "Failed to converge to a solution. This is typically due to unusually high or low inputs."
        app_warn(e)
    except ValueError as e:
        tmp["error"] = True
        tmp["msg"] = "An error occurred: " + str(e) + ". You likely have extreme values for effect size and/or standard deviation. A good starting point is (effect size)/(standard dev) = 0.5"
    except Exception as e:
        app_warn(e)
        app_warn('in Exception');
        tmp["error"] = True
        tmp["msg"] = "An error occurred: " + str(e)
    #'''
    
    if transFn is not None:            
        retval = tmp["value"]
        retval = transFn(retval)
        tmp["value"] = list(retval)
        if ("valueDunnett" in tmp) and (len(tmp["valueDunnett"])>0):
            tmp["valueDunnett"] = list(transFn(tmp["valueDunnett"]))
            tmp["valueTukey"]   = list(transFn(tmp["valueTukey"]))
        
    return json.dumps(tmp)

@app.route('/tools_demos', methods = ['POST'])
def tools_demos():
    from pyhelp import helpFun
    
    data = request.get_json();
    tooltype = data["type"]
    es = data["es"]
    ss = data["ss"]

    if tooltype == "effectSize":
        tmp = helpFun.efctSizer( es )
    elif tooltype == "effectSizeANOVA":
        tmp = helpFun.efctSizerANOVA(ss,es,data["stdev"],data["sig"],data["nGroups"])
    elif tooltype == "ANOVAmeans":
        tmp = helpFun.setThreeNormals(data["mean1"],data["mean2"],data["stdev"])
    elif tooltype == "sampleSize":
        tmp = helpFun.sampSizer(ss)
    elif tooltype == "power":
        tmp = helpFun.powerSizer(ss, es, data["stdev"], data["sig"])
    elif tooltype == "stdev":
        tmp = helpFun.stdever( data["stdev"] )
    elif tooltype == "sigLevel":
        tmp = helpFun.sigLeveler( data["sig"] )
    else:
        raise("No tools demo selected")
    
    for keystr in tmp.keys():
        if type(tmp[keystr]) is numpy.ndarray:
            tmp[keystr] = tmp[keystr].tolist()

    # two vars to pass back
    tmp["nGroups"]  = data["nGroups"]
    tmp["id"]       = data["id"]
    
    return json.dumps(tmp)

@app.route('/power_plot_calc', methods = ['POST'])
@auth_required
def power_plot_calc():
    data = request.get_json();
    
    if True:   # use R
        from pyhelp.old_r_interface_fns import power_plot_calc_R
        dataOut = power_plot_calc_R(data)
        return json.dumps(dataOut)
    
    eps      = numpy.finfo(float).eps
    effect   = data["effect"]
    power    = data["power"]
    sigLevel = float( data["sig"] )
    testType = data["test"]
    nGroups  = data["nGroups"]
    
    npts        = 100       # number of points to plot
    effectSize  = numpy.linspace(effect["minValue"], effect["maxValue"], npts);
    powerSize   = numpy.arange(power["minValue"], power["maxValue"]+eps, power["options"]["step"]);
    
    isTest = getTestType(testType)
    
    tmp = 0.0
    if isTest["oneT"] | isTest["twoT"] | isTest["pairedT"]:
        tmp = powerCalc.powerPlot_TTest(testType, effectSize, powerSize, sigLevel, nGroups[0])

    elif isTest["oneAOV"]:
        tmp = powerCalc.powerPlot_AOV1(effectSize, powerSize, sigLevel, nGroups[0])

    elif isTest["twoAOV"]:
        tmp = powerCalc.powerPlot_AOV2(effectSize, powerSize, sigLevel, nGroups, data["aovEffect"])

    elif isTest["multAOV"]:
        tmp = powerCalc.powerPlot_AOVM(effectSize, powerSize, sigLevel, data["totGrpProd"], data["numdf"], data["lambda1"])
    
    tmp         = numpy.ceil( tmp )    # make sample size integers
    tmp         = numpy.matrix(tmp)
    tmp         = numpy.transpose(tmp)
    data        = tmp.tolist();
    data        = {'x':effectSize.toList(), 'y':data}
    
    return json.dumps({'x':numpy.asarray(effectSize).tolist(), 'y':data})

@app.route('/rng_table', methods=['POST'])
def rng_table():
    data = request.get_json()

    nSubPerGp               = data["n"]
    nLevelsEachTrtFactor    = data["treatmentLevels"]
    nLevelsEachNonTrtFactor = data["nonTreatmentLevels"]
    isCrossOver             = data["isCrossOver"]
    
    if len(nLevelsEachNonTrtFactor) == 0:   # if no non-treatments
        nLevelsEachNonTrtFactor = [1]
    
    nLevelsEachTrtFactor    = numpy.asarray( nLevelsEachTrtFactor )
    nLevelsEachNonTrtFactor = numpy.asarray( nLevelsEachNonTrtFactor )
    
    ntF = nLevelsEachTrtFactor.size;            # no dims of treatments
    ntG = numpy.prod(nLevelsEachTrtFactor);     # total number of treatment groups
    nfF = nLevelsEachNonTrtFactor.size;         # no dims of non-treatment factors
    nfG = numpy.prod(nLevelsEachNonTrtFactor);  # total number of nontreatment factor groups
    ntS = ntG*nSubPerGp;                        # total number of subjects per non-treatment factor

    output = numpy.zeros([nSubPerGp,ntG,nfG], int)
    
    import random
    for kk in range(nfG):
        x = random.sample(range(ntS), ntS)
        x = numpy.asarray(x)+1
        output[:,:,kk] = x.reshape([nSubPerGp,ntG])
    
    return json.dumps( output.tolist() )


@app.route('/uploadCSV', methods=['POST'])
def uploadCSV():
    filedata = False
    status = False
    
    try:
        # check if the post request has the file part
        if 'file' not in request.files:
            filedata = 'No file available'
            #return redirect(request.url)
        else:
            file = request.files['file']
            # if user does not select file, browser also
            # submit an empty part without filename
            if file.filename == '':
                filedata = 'No selected file'
                
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filedata = file.read().decode('utf-8')
                status = True
                
                #import csv
                #tmpreader = csv.reader(filedata.splitlines(), delimiter=',')
                #parseddata = [row for row in tmpreader]
                
            else:
                filedata = ('Only files of %s type allowed' % (ALLOWED_EXTENSIONS))
    except Exception as e:
        status = False
        filedata = str(e)
    
    return jsonify({'content': filedata, 'status':status})

@app.route('/sim_plot_calc', methods = ['POST'])
#@auth_required         # remove since this is used in Help pages (don't need to be logged in)
def sim_plot_calc():
    data = request.get_json();
    
    delta    = data["effectSize"]   # effect size
    sigma    = data["std"]          # std dev
    alpha    = data["sig"]          # significance
    n        = data["n"]            # number of subjects per group
    isTest   = getTestType( data["test"] )
    
    csvdata = None
    if "csvdata" in data:
        csvdata = data["csvdata"]
    
    from pyhelp import simCalcDriver
    
    try:
        if isTest["twoT"]:
            mu = 4.0*sigma                  # arbitary value for mean, to make plots look nice (for T-Test!)
            output = simCalcDriver.twoSampleT(mu,delta,sigma,n,alpha, csvdata)

        elif isTest["oneAOV"]:
            output = simCalcDriver.oneWayANOVA(data["mu"],delta,sigma,n,alpha, data["p"], data["iType"], csvdata)
            
        elif isTest["twoAOV"]:
            nLevels     = data["nLevels"]
            effectSizes = delta*numpy.ones(3)
            respTypes   = data["iType"]
            
            output = simCalcDriver.twoWayANOVA(data["mu"], effectSizes, sigma, n, alpha, nLevels, respTypes, csvdata)
            
        elif isTest["multAOV"]:
            nLevels     = data["nLevels3"]
            effectSizes = delta*numpy.ones(7)
            respTypes   = numpy.repeat([data["iType"][0], data["iType"][1]], 3)

            output = simCalcDriver.threeWayANOVA(data["mu"], effectSizes, sigma, n, alpha, nLevels, respTypes, csvdata)
        
        output["error"] = False
        
    except Exception as e:
        output = {'error': True, 'msg': str(e)}
        app_warn(e)
    
    dataOut = json.dumps( output )  # convert dict output to json
    return dataOut

@app.route('/saveUserData', methods = ['POST'])
@uid_match_required
def saveUserData():
    data        = request.get_json()    # grab the json data that's coming in (from saveToolsController); it becomes a dict()
    user_id     = data['user_id']
    projectname = data['project']
    toolType    = None

    if "tool" in data:
        toolType = data["tool"]
    
    if toolType == "samplesize":
        app_database.saveSample(user_id, projectname, json.dumps(data))     # json.dumps(data) converts dict() to json string
    elif toolType == "power":
        app_database.savePower(user_id, projectname, json.dumps(data))
    elif toolType == "design_guide":
        app_database.saveDesignGuideToProject(user_id, projectname, json.dumps(data))
    else:
        plotname = data['plotname']
        app_database.saveGraph(user_id, projectname, json.dumps(data["data"]), plotname)
    
    return 'OK'
#--------------------------------------------------------#


#--------------------------------------------------------#
# Design Guide Summary Report 
#--------------------------------------------------------#
@app.route('/update_design_summary', methods=['POST'])
def update_design_summary():
    
    data = request.get_json();
    
    dataOut = {"error":False, "msg": ''}
    try:
        app_database.saveDesignGuideTempData(data["user_id"], json.dumps(data));
    except Exception as e:
        dataOut["error"] = True
        dataOut["msg"] = "An error occurred: " + str(e)

    return json.dumps(dataOut)

def design_report_template_input_data(dataOut):
    # Need to do error-checking here to see if dataOut gives data back.
    # If accessed correctly, it should give data back
    if dataOut is None:
        return 'No data given'
    
    designFormData = dataOut #json.loads( dataOut );
    toolsData = designFormData["tools"]
    
    if toolsData:
        toolsData["combinations"] = genC.genCombinations( toolsData["treatmentsTotal"] )[1]
        toolsData["isTest"] = getTestType( toolsData["test"] )
        
    allTreatmentsAndFactors = designFormData["treatments"] + designFormData["factors"]
    
    return render_template("static/partials/webpage_reports/templates/report.design.template.html", 
        treatments=designFormData["treatments"], 
        email=designFormData["email"],
        factors=designFormData["factors"], 
        designType=designFormData["designType"], 
        statMethod=designFormData["statMethod"], 
        treatment_table=designFormData["treatment_table"], 
        hypoth=designFormData["hypothesis"], 
        outMeas=designFormData["outMeas"], 
        obsUnits=designFormData["obsUnits"],
        outputGraphs=designFormData["outputGraphs"], 
        graphsText=designFormData["graphsText"], 
        addlControls=designFormData["nControlAdditionalSelected"], 
        row=toolsData,
        allTreatmentsAndFactors=allTreatmentsAndFactors)   

@app.route('/design_report_template', methods=['GET', 'POST'])
def design_report_template(userid=None):
    dataOut = app_database.getDesignGuideTempData(userid)
    return design_report_template_input_data(dataOut)

@app.route('/design_report', methods=['GET'])
def design_report():
    user_id = request.args.get('user_id')
    
    if user_id and user_id.lower() == 'null':
        user_id = None
    
    authDict    = json.loads( check_auth() )
    tmp         = design_report_template( user_id )
    dg_pdf      = HTML( string=tmp )
    
    return render_pdf( dg_pdf )


#--------------------------------------------------------#
def get_auth():
    if auth0_constants['PROFILE_KEY'] not in session:
        retval = {'authenticated': False}
    else:
        retval = {'authenticated': True, 'user_info': session[ auth0_constants['PROFILE_KEY'] ]}
    
    return retval
    
@app.route('/check_auth')
def check_auth():
    return json.dumps( get_auth() )
    
@app.route('/callback')
def callback_handling():
    auth0.authorize_access_token()
    resp = auth0.get('userinfo')
    userinfo = resp.json()
    
    import re
    user_id = userinfo['sub']
    user_id = re.sub("auth0\|", "", user_id)
    
    authData = auth0_controller.find_user_by_id(user_id)
    email = authData["email"]
    
    session[auth0_constants['JWT_PAYLOAD']] = userinfo
    session[auth0_constants['PROFILE_KEY']] = {
        'user_id': user_id,
        'email': email
    }
    
    # If a user is not in the database, add them with a "None" Stripe customer id.
    # If a user is already in the database, nothing will happen.
    date = str(datetime.now())
    app_database.makeNewUser(user_id, email, None, date)
    
    return redirect('/account/')

@app.route('/login')
def login():
    AUTH0_AUDIENCE = 'https://webmaster.auth0.com/userinfo'
    AUTH0_CALLBACK_URL = url_for('callback_handling', _external=True)
    
    return auth0.authorize_redirect(redirect_uri=AUTH0_CALLBACK_URL, audience=AUTH0_AUDIENCE)

@app.route('/logout')
def logout():
    from urllib.parse import urlencode
    session.clear()
    LOGOUT_URL = url_for('index_js_route', _external=True)
    LOGOUT_URL = request.host_url + 'auth/logout.html'
    
    params = {'returnTo': LOGOUT_URL, 'client_id': auth0.client_id}
    return redirect(auth0.api_base_url + '/v2/logout?' + urlencode(params))


#--------------------------------------------------------#

#'''
@app.errorhandler(404)
def page_not_found(e):
    #app_warn( e );
    #app_warn( request.url )
    return redirect('/404.html')  # return AngularJS error page
#'''
    
if __name__ == '__main__':
    app.run(port=1028, debug=True)
 
