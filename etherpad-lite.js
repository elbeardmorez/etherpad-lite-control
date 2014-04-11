
function setCookie(sName, sValue, lExpire) {
  if (!lExpire)
    var lExpire = 365;
  var dtExpiry = new Date();
  dtExpiry.setDate(dtExpiry.getDate() + lExpire);
  document.cookie = sName + "=" + escape(sValue) + ";expires=" + dtExpiry.toGMTString();
}
function getCookie(sName) {
  if (document.cookie.length > 0) {
    lStart = document.cookie.indexOf(sName + "=");
    if (lStart != -1) {
      lStart += sName.length + 1;
      var lEnd = document.cookie.indexOf(";", lStart);
      if (lEnd == -1)
        lEnd = document.cookie.length;
      return unescape(document.cookie.substring(lStart, lEnd));
    }
  }
  return "";
}

function loadState() {
  var arr = [ 'epc_server', 'epc_port', 'epc_basepath', 'epc_apiversion' ];
  for (idx in arr) {
    var sElement = arr[idx];
    console.log('restoring state for: \'' + sElement + '\'');
    document.forms['etherpad-lite'][sElement].value = getCookie(sElement);
  }
}

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

function ep_call(func, args) {
  console.log('[debug|ep_call]');
  if (args === undefined)
    var args = [];
  sServer = getServer();
  sApiVersion = getApiVersion(); 
  sData = '';
  jsonData = undefined;
  $.ajax({
    url: './etherpad-lite.php',
    type: 'POST',  
    async: false,
    dataType: 'json',
    data: { 'func' : func,
            'args' : args,
            'url' : sServer },
    success: function(data, textStatus, textStatus, jqXHR) {
      console.log('[debug|ep_call] success');
      sData = data['raw'];
      jsonData = data['data'];
    },
    failure: function(data, textStatus, textStatus, jqXHR) {
      console.log('[debug|ep_call] failure');
      sData = data['raw'];
    }
  });
  $('#epStatus').html(sData);
  return jsonData;
}

function epc_status() {
  console.log('[debug|epc_status]');
  ep_call('checkToken');
}

function epc_pads() {
  console.log('[debug|epc_pads]');
  jsonData = ep_call('listAllPads')
  if (jsonData !== undefined) {
    // process
    $('#epPads').html('');
    $('#epPadsTitle').html('pads (' + jsonData['padIDs'].length + ')');
    if (jsonData['padIDs'].length > 0) {
      $('#epPads').html('<option value="0">All</option>');
      $.each(jsonData['padIDs'], function(key, value) {
        $('#epPads').append('<option>' + value + '</option>');
      });
    }
  }
}

function epc_content() {
  console.log('[debug|epc_content]');
  selected = $('#epPads :selected').map(function(){return this.value;}).get();
  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    var args = [selected[0]];
    jsonData = ep_call('getHTML', args);
    if (jsonData !== undefined) {
      $('#popupContent').html(jsonData['html']);
      popupToggle();
    }
  }
}

function popupToggle() {
  if ($('#popup-background').css('display') === 'none') {
    $('#popup-background').css('display', 'block');
    $('#popup-outer').css('display', 'block');
  } else {
    $('#popup-background').css('display', 'none');
    $('#popup-outer').css('display', 'none');
  }
}

