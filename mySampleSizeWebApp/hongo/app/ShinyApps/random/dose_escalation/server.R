# server.R Dose Escalation

shinyServer(
  function(input, output) {
    
    
    output$caption <- renderUI({
      HTML("We strongly recommend you seek the advice of a professional for this type of design.")
    }) 
    
    
  }
)


