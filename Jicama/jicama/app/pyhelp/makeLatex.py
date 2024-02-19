from pylatex import Document, Section, Itemize, Subsection, Tabular, Math, TikZ, Axis, \
    Plot, Figure, Package, Matrix, Command
from pylatex.utils import italic, NoEscape

def stringIt(key):
    return str(key['name']) + ": " + str(key['content'])
    
def makeLatex(data):
    tmp = "empty string placeholder";
    
    methods = data['methods']
    stats   = data['stats']
    results = data['results']
    discuss = data['discussion']
    
    #for key in methods['expProcedures']:
    #    itemize.add_item( key['name'] + ": " + key['content'] )
        
    #=========================================
    
    from datetime import datetime
    date = str(datetime.now())
    
    path = "static/img/arrive/"
    tmpname = "tmp"
    filename = "ARRIVE"

    doc = Document( default_filepath=str(path+tmpname) )
    doc.packages.append(Package('geometry', options=['margin=1in']))
    doc.packages.append(Package('graphicx'))

    doc.append(NoEscape(
        r"""
        \pagestyle{plain}
        \thispagestyle{empty}
        \makebox[0pt][r]{\rule{.3\textwidth}{1.5pt}}
        \\[.5in]
        \large{\\
        \includegraphics[width=4cm]{arrivelogo.png}\\
        Animal Research: Reporting of In Vivo Experiments 
        } 
        \\[.5in]
        \makebox[0pt][l]{\rule{1.3\textwidth}{1.5pt}}
        \\[4.5in]
        A Supplemental Template Created By\\
        TEMPEST TECHNOLOGIES \includegraphics[width=.5cm]{logopic.png}\\
        \\[.5in]
        \today
        \newpage
        """))

    #doc.preamble.append(Command('title', data['title']))
    #doc.preamble.append(Command('author', data['authors']))
    #doc.append(NoEscape(r'\maketitle'))

# Template Header
    with doc.create(Section('')):
      with doc.create(Itemize()) as itemize:
        itemize.add_item( data['title'] )
 
 # Introduction 
    with doc.create(Section('Introduction')):
        with doc.create(Subsection('Motivation')):
            doc.append(tmp)
        with doc.create(Subsection('Relevance')):
            doc.append(tmp)
        with doc.create(Subsection('Objective(s)')):
            itemize.add_item(tmp)
            itemize.add_item(tmp)

# Methods
    with doc.create(Section('Methods')):
        with doc.create(Subsection('Ethical Statement')):
            doc.append('This study follows the guidelines outlined in the following documentation;')
            with doc.create(Itemize()) as itemize:
                itemize.add_item( methods['ethicalStatement'] )
                
        with doc.create(Subsection('Study Design')):
            doc.append('This study design can be outlined as follows;')
            with doc.create(Itemize()) as itemize:
                itemize.add_item(tmp + " Experimental Group(s)")
                itemize.add_item(tmp + " Control Group(s)")
                itemize.add_item("Randomization: " + tmp)
                itemize.add_item("Blinding:" + tmp)
                #itemize.add_item("The experimental unit: " + str(methods['expUnits']))
                #with doc.create(Figure(position='h!')):
                #    doc.append(NoEscape(r'\includegraphics{study_design_pic.png}'))
                    
        with doc.create(Subsection('Experimental Procedures')):
            doc.append('The experimental procedures are summarized as follows;')
            with doc.create(Itemize()) as itemize:
                    for key in methods['expProcedures']:
                        itemize.add_item( stringIt(key) )

        with doc.create(Subsection('Experimental Subject')):
            with doc.create(Itemize()) as itemize:
                    for key in methods['expSubject']:
                        itemize.add_item( stringIt(key) )

        with doc.create(Subsection('Housing and Husbandry')):
            with doc.create(Itemize()) as itemize:
                    for key in methods['housingHusbandry']:
                        itemize.add_item( stringIt(key) )

        with doc.create(Subsection('Sample Size')):
            doc.append("The total sample size of this study was " + tmp)
            doc.append("Sample Size was carried out using the Tempest Technologies Sample Size Calculator." + tmp)
            with doc.create(Itemize()) as itemize:
                itemize.add_item("Experimental Group: " + tmp)
                itemize.add_item("Control Group: " + tmp) 
                itemize.add_item("Independent Replication of each experiment: " + tmp)
                
        with doc.create(Subsection('Allocation to Experimental Groups')):
            for key in methods['allocation']:
                doc.append( tmp )


# Statistics
    with doc.create(Section('Statistics')):
        with doc.create(Subsection('Graph')):
            #with doc.create(Figure(position='h!')) as stats_pic:
            #    stats_pic.add_image('results.png', width='120px')
            #    stats_pic.add_caption('This graph needs a caption')

            for key in stats:
                doc.append( stringIt(key) )


# Results
    with doc.create(Section('Results')):
        #with doc.create(Subsection('Baseline Data: Table of Results')):
        #    with doc.create(Tabular('r|r')) as table:
        #        table.add_hline()
        #        table.add_row(("information", baseline))
        #        table.add_empty_row()
        #        table.add_row(("information", baseline))
        with doc.create(Subsection('Numbers Analyzed')):
            with doc.create(Itemize()) as itemize:
                for key in results['numbersAnalyzed']:
                    itemize.add_item( stringIt(key) )
                    
        with doc.create(Subsection("Outcomes and Estimations")):
            for key in results['outcomes']:
                doc.append( stringIt(key) )
            
        with doc.create(Subsection('Adverse Events')):
            for key in results['adverseEvents']:
                doc.append( stringIt(key) )


# Discussion
    with doc.create(Section('Results')):
        with doc.create(Subsection('Interpretation/Scientific Implications')):
            for key in discuss['interpret']:
                doc.append( stringIt(key) )

        with doc.create(Subsection('Generalisability')):
            doc.append(tmp)
            
        with doc.create(Subsection('Funding')):
            doc.append("i. " + tmp)
    
# Generate Final report
    
    import os
    
    # This works for now, but need a better replacement for this ... os.rename raises an error if the file already exists
    try:
        os.remove(path+tmpname+".tex")
    except:
        pass
        
    try:
        os.remove(path+filename+".tex")
    except:
        pass
        
    try:
        os.remove(path+tmpname+".pdf")
    except:
        pass
    
    try:
        os.remove(path+filename+".pdf")
    except:
        pass
    
    doc.generate_tex();
    os.rename(path+tmpname+".tex", path+filename+".tex")
    doc.generate_pdf()
    os.rename(path+tmpname+".pdf", path+filename+".pdf")
    return( path+filename ) 
    