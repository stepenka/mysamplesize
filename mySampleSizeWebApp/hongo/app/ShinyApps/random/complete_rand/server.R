# server.R Completely Randomized Design

shinyServer(
  function(input, output) {
    
    datum <- reactive({
      if(input$button == 0)
      {  
        return()
      }  
      isolate({ 
      
      N <- input$k * input$n_group
      matrix(
        sample(1:N, N),
        nrow=input$n_group,
        ncol=input$k,
        byrow = TRUE)
      
      })
      
    })
    
    
    #options(xtable.include.rownames=F)
    output$table <- renderTable({
        datum()
    })
    
    
    #User Download
    output$download <- renderUI({
      if(input$button == 0)
      {  
        return()
      }
      isolate({
        downloadButton('downloadTable', 'Download Table',class='shiny_button')
      })
    })
    
    output$downloadTable <- downloadHandler(
      filename = 'RNG.csv',
      content = function(file) {
        write.csv(datum(), file)
      }
    )
    
  }
)

