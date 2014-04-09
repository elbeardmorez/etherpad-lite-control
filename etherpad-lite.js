
function getServer() {
  return document.forms['etherpad-lite']['epc_server'].value + ":" +
         document.forms['etherpad-lite']['epc_port'].value +
         (document.forms['etherpad-lite']['epc_basepath'].value ? "/" +
         document.forms['etherpad-lite']['epc_basepath'].value : ""); 
}
function getApiVersion() {
         (document.forms['etherpad-lite']['epc_apiversion'].value ? "/" +
          document.forms['etherpad-lite']['epc_apiversion'].value : "1.0.0"); 
}

function epc_status() {
  console.log('[debug|ep_status]');
  sServer = getServer();
  sApiVersion = getApiVersion(); 
  sData = '';
  $.ajax({
    url: './etherpad-lite.php',
    type: 'POST',  
    async: false,
    data: { 'func' : "checkToken",
            'url' : sServer },
    success: function(data, textStatus, textStatus, jqXHR) {
      console.log('[debug|ep_status] success');
      sData = data;
    },
    failure: function(data, textStatus, textStatus, jqXHR) {
      console.log('[debug|ep_status] failure');
      sData = data;
    }
  });
  $('#epStatus').html(sData);
}

