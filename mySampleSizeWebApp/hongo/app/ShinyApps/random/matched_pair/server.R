# server.R Matched Pair

shinyServer(
  function(input, output) {
    
    ############SETUP UI#################
    
    #Show Download button after Table has been generated
    output$download <- renderUI({
      if(input$button == 0)
      {  
        return()
      }
      isolate({
        downloadButton('downloadTable', 'Download Table',class='shiny_button')
      })
    })
    
    ############SETUP CALCULATIONS#################
    row_names <- reactive({
      names <- lapply(1:input$pairs, function(i) {
        paste('Pair ', i)
      })
      c(unlist(names))
    })
    
    col_names <- c('Subject 1','Subject 2')
    
    treatment <- c('T1','T2')
    
    ############CALCULATIONS#################
    
    #Generate Random Numbers
    fill <- reactive ({
      if(input$button == 0)
      {  
        return()
      }  
      isolate({ 
        replicate(input$pairs,{
          sample(treatment,2)
        })
      })
    })
    
    #Make Results Table
    datum <- reactive({
      
      tryCatch({
        transpose <- t(fill())
        datum <- as.data.frame(transpose)
        colnames(datum) <- col_names
        cbind(Matched_Pair=row_names(),datum)
        
      }, error=function(e){cat("ERROR :",conditionMessage(e), "\n")})
    })
    
    ############OUTPUTS#################
    
    
    #options(xtable.include.rownames=F)
    output$table <- renderDataTable({
      datum()
    }, options = list(searching=0, ordering=0, processing=0, paging=0, info=0)) 
    
    #User Download
    output$downloadTable <- downloadHandler(
      filename = 'RNG.csv',
      content = function(file) {
        write.csv(datum(), file)
      }
    )
  
    
    output$results <- renderText({
    'Key: TI: Treatment 1 (or Control) | T2: Treatment 2'
    })
    
  })
