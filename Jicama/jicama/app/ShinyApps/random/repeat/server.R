# server.R Repeated Measures

shinyServer(
  function(input, output) {
    
    ############SETUP UI#################
    #Dynamic number of Main Factor column names
    output$treat_names = renderUI({
      lapply(1:input$main_factors, function(i) {
        textInput(paste0('treat', i), paste0('Name Treatment/Factor', i),paste0('Treatment',i),width='100%',paste0('Treatment',i))
      })
    })
    
    #Dynamic number of Blocking Factors
    output$block_groups = renderUI({
      lapply(1:input$block_factors, function(i) {
        selectInput(paste0('groups', i), paste0('# Groups in Block ', i),choices = c(2:20))
      })
    })
    
    #Dynamic number of Blocking Factors Titles
    #output$rownames = renderUI({
    #  for (n in 1:input$blockfactors){ 
    #    lapply(1:n, function(i) {
    #      textInput(paste0('row', i), paste0('Name', i),paste0('Block',i),width='100%',paste0('Block',i))
    #  })
    #  }
    #})
    
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
    
    #error check  
    error <- reactive ({
      is.wholenumber <- function(x, tol = .Machine$double.eps^0.5) min(abs(c(x%%1, x%%1-1))) < tol
      if (is.wholenumber(input$sample/input$main_factors) == "TRUE"){
        0
      } else {1}
    })
    
    replicates <- reactive({
      if (error()==0){
        as.numeric(input$sample) / as.numeric(input$main_factors)
      } else {1}
    })
    
    treat_names <- reactive({
      names <- lapply(1:input$main_factors, function(i){
        input[[paste0("treat",i)]]
      })
      c(rep(unlist(names),replicates()))
    })
    
    num_block_groups <- reactive({
      list <- lapply(1:input$block_factors, function(i) {
        as.numeric(input[[paste0("groups",i)]])
      })
      do.call(prod,list)
    })
    
    ############CALCULATIONS#################
    
    #Generate Random Numbers
    fill <- reactive ({
      if(input$button == 0)
      {  
        return()
      }  
      isolate({ 
        
        replicate(num_block_groups(),{
          sample(1:input$sample,input$sample)
        })
      })
    })
    
    #Make Results Table
    datum <- reactive({
      if(error() == 0){
        tryCatch({
          datum <- data.frame(treat_names(),fill())
          groups <- lapply(1:num_block_groups(), function(i) {
            paste('Group', i)
          })
          colnames(datum) <- c("MainFactor",unlist(groups))
          
          datum
          
        }, error=function(e){cat("ERROR :",conditionMessage(e), "\n")})
      }
    })
    
    ############OUTPUTS#################
    
    #Error Warning
    output$error <- renderUI({
      if (error()==1){
        HTML(paste("This design has ",replicates()," replicate(s).","<br><p class='text-danger'><b>Error: Unbalanced Design</b></p><br><small>The Sample Size Per Group divided by the Number of Groups in the Main Treatment must be a whole number. Please try increasing your Sample Size Per Group.</small>"))
      } else if (error()==0){
        HTML(paste("This design has ",replicates()," replicate(s)."))
      }
    })
    
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
      HTML("<b>How many Groups in the Main Treatment/Factor (eg Control, Treatment A, Drug B);</b>")
    })
    
    output$title2 <- renderUI({
      HTML("<b>How many additional Groups or Blocking Factors(eg sex, litter, or size);</b>")
    })
    
    output$results <- renderText({
      
    })
    
  })

