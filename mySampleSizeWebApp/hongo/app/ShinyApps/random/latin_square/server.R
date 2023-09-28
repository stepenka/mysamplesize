# server.R Latin Square

shinyServer(
  function(input, output) {
    
    ############SETUP UI#################
    #Dynamic number of Main Factor column names
    output$times = renderUI({
      lapply(1:input$factors, function(i) {
        textInput(paste0('time', i), paste0('Time Period ', i),paste0('Time',i),width='100%',paste0('Time',i))
      })
    })
    
    col_names <- reactive({
      names <- lapply(1:input$subjects, function(i) {
        paste('Subject', i)
      })
      c(unlist(names))
    })
    
    row_names <- reactive({
      names <- lapply(1:input$factors, function(i){
        input[[paste0("time",i)]]
      })
      c(unlist(names))
    })
    
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

    
    ############CALCULATIONS#################
    
    #Generate Random Numbers
    fill <- reactive ({
      if(input$button == 0)
      {  
        return()
      }  
      isolate({ 
        replicate(input$subjects,{
          sample(LETTERS[1:input$factors],input$factors)
        })
      })
    })
    
    #Make Results Table
    datum <- reactive({

        tryCatch({
          datum <- data.frame(row_names(),fill())
          colnames(datum) <- c("Time Period",col_names())
          datum
          
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
    
    output$title1 <- renderUI({
      HTML("<b>Name of the Time Periods for your experiment;</b>")
    })
    
    output$title2 <- renderUI({
      HTML("<b>How many total Factors (eg Control + Treatments);</b>")
    })
    
    output$results <- renderText({

    })
    
  })
