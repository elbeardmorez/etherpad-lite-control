
var pads = {};

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
  var arr = [ 'epc_server', 'epc_port', 'epc_apikeypath' ];
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

function ep_call(verbose, func, args) {
//  console.log('[debug|ep_call]');
  if (verbose === undefined)
    var verbose = true;
  if (func === undefined)
    var func = "checkToken";
  if (args === undefined)
    var args = [];
  sServer = getServer();
  sApiKeyPath = $('#epc_apikeypath').attr('value');
  sData = '';
  jsonData = undefined;
  $.ajax({
    url: './etherpad-lite.php',
    type: 'POST',  
    async: false,
    dataType: 'json',
    data: { 'func' : func,
            'args' : args,
            'url' : sServer,
            'apiKeyPath' : sApiKeyPath },
    success: function(data, textStatus, textStatus, jqXHR) {
//      console.log('[debug|ep_call] success');
      sData = data['raw'];
      jsonData = data['data']['data'];
      if (jsonData === null && data['data']['code'] == 0)
        jsonData = true;
    },
    failure: function(data, textStatus, textStatus, jqXHR) {
//      console.log('[debug|ep_call] failure');
      sData = data['raw'];
    }
  });
  if (verbose)
    $('#epStatus-inner').html(sData);
  return jsonData;
}

function epc_status(verbose) {
  console.log('[debug|epc_status]');
  ep_call(verbose, 'checkToken');
}

function epc_content(verbose) {
  console.log('[debug|epc_content]');
  selected = $('#epPads :selected').map(function(){return this.value;}).get();
  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    var args = [selected[0]];
    jsonData = ep_call(verbose, 'getHTML', args);
    if (jsonData !== undefined) {
      $('#popupTitle').html(selected[0]);
      $('#popupContent').html(jsonData['html']);
      popupToggle('ok');
    }
  }
}

function epc_pads(verbose) {
  console.log('[debug|epc_pads]');
  jsonData = ep_call(verbose, 'listAllPads')
  if (jsonData !== undefined) {
    // process
    if (jsonData['padIDs'].length > 0) {
      $.each(jsonData['padIDs'], function(idx, padID) {
        if (pads[padID] === undefined)
          pads[padID] = {'id': padID};
        var args = [padID]
        jsonData2 = ep_call(false, 'getPublicStatus', args);
        if (jsonData2 !== undefined && jsonData2 !== null) {
          if (jsonData2)
            pads[padID]['public'] = true;
          else
            pads[padID]['public'] = false;
        }
      });
      // update select control
      epc_padsType($('#epPadsType').attr('value'));
    }
  }
}
function epc_padsType(type) {
  console.log('[debug|epc_padsType]');

  switch (type) {
    case "":
      console.log("[debug|epc_padsType] selected all pads");
      break;
    case "Public":
      console.log("[debug|epc_padsType] selected public pads only");
      break;
    case "Private":
      console.log("[debug|epc_padsType] selected private pads only");
      break;
  }
  $('#epPads').html('<option value="0">All</option>');
  $.each(pads, function(idx, value) {
    switch (type) {
      case "":
        $('#epPads').append('<option>' + value['id'] + '</option>');
        break;
      case "Public":
        if (value['public'] !== undefined && value['public'] === true)
          $('#epPads').append('<option>' + value['id'] + '</option>');
        break;
      case "Private":
        if (value['public'] !== undefined && value['public'] !== true)
          $('#epPads').append('<option>' + value['id'] + '</option>');
        break;
    }
  });
  $('#epPadsTitle').html('pads (' + ($('#epPads')[0].length - 1) + ')');
}
function epc_padsAdd(verbose, data) {
  console.log('[debug|epc_padsAdd]');
}
function epc_padsRemove(verbose, data) {
  console.log('[debug|epc_padsRemove]');

  selected = $('#epPads :selected').map(function(){return this.value;}).get();
  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_padsRemove] confirmation message');
      sMessage = '<p>are you sure you want to delete the following pads</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      // set the click handler
      $('#popup-button-ok').off("click");
      $('#popup-button-ok').on('click', function() {epc_padsRemove(true, true);});
      popupToggle('yes|no');
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        selectedIndex = $("#epPads option:selected")[0].index;
        $.each(selected, function(key, value) {
          var args = [value];
          jsonData = ep_call(verbose, 'deletePad', args);
          console.log('[info] deleted pad, id: \'' + value + '\'');
        });
        // reload pads
        epc_pads(false);
        // reselect
        if (selectedIndex > $('#epPads')[0].length)
          selectedIndex = $('#epPads')[0].length;
        $('#epPads')[0].selectedIndex = selectedIndex;
      }
    }
  }
}

function epc_groups(verbose) {
  console.log('[debug|epc_groups]');
  jsonData = ep_call(verbose, 'listAllGroups')
  if (jsonData !== undefined) {
    // process
    $('#epGroups').html('');
    $('#epGroupsTitle').html('groups (' + jsonData['groupIDs'].length + ')');
    if (jsonData['groupIDs'].length > 0) {
      $('#epGroups').html('<option value="0">All</option>');
      $.each(jsonData['groupIDs'], function(key, value) {
        $('#epGroups').append('<option>' + value + '</option>');
      });
    }
  }
}
function epc_groupsAdd(verbose, data) {
  console.log('[debug|epc_groupsAdd]');
}
function epc_groupsRemove(verbose, data) {
  console.log('[debug|epc_groupsRemove]');
}

function epc_authors(verbose) {
  console.log('[debug|epc_authors]');
  jsonData = ep_call(false, 'listAllPads')
  authors = {};
  authorNames = {};
  if (jsonData !== undefined) {
    $.each(jsonData['padIDs'], function(idx, padID) {
      var args = [padID];
      jsonData2 = ep_call(false, 'listAuthorsOfPad', args);
      if (jsonData2 !== undefined) {
        $.each(jsonData['authorIDs'], function(idx2, authorID) {
          var authorName = authorNames[authorID];
          if (authorName === undefined) {
            var args2 = [authorID];
            jsonData3 = undefined;
            jsonData3 = ep_call(true, 'getAuthorName', args2);
            if (jsonData3 !== undefined && jsonData3 !== null) {
//              authorName = jsonData3['authorName'] // api bug?
              authorName = jsonData3
              authorNames[authorID] = authorName;
            }
          }
          if (authorName !== undefined)
            authors[authorID] = jsonData3 + ' [' + authorID + ']';
          else
            authors[authorID] = '[' + authorID + ']';
        });
      }
    });
  }
  $('#epAuthors').html('<option value="0">All</option>');
  $.each(authors, function(idx, value) {
    $('#epAuthors').append('<option>' + value + '</option>');
  });
}
function epc_authorsAdd(verbose, data) {
  console.log('[debug|epc_authorsAdd]');
}
function epc_authorsRemove(verbose, data) {
  console.log('[debug|epc_authorsRemove]');
}

function popupToggle(type) {
  if (type === undefined)
    var type = "ok";
  switch (type) {
    case "ok":
      $('#popup-button-ok').css('opacity', 1.0);
      $('#popup-button-ok').attr('value', 'ok');
      $('#popup-button-ok').off("click");
      $('#popup-button-ok').on('click', function(){ popupToggle(); });
      $('#popup-button-cancel').css('opacity', 0.0);
      break;
    case "ok|cancel":
      $('#popup-button-ok').css('opacity', 1.0);
      $('#popup-button-ok').attr('value', 'ok');
      $('#popup-button-cancel').css('opacity', 1.0);
      $('#popup-button-cancel').attr('value', 'cancel');
      $('#popup-button-cancel').off("click");
      $('#popup-button-cancel').on("click", function(){ popupToggle(); });
      break;
    case "yes|no":
      $('#popup-button-ok').css('opacity', 1.0);
      $('#popup-button-ok').attr('value', 'yes');
      $('#popup-button-cancel').css('opacity', 1.0);
      $('#popup-button-cancel').attr('value', 'no');
      $('#popup-button-cancel').off("click");
      $('#popup-button-cancel').on("click", function(){ popupToggle(); });
      break;
  }
  if ($('#popup-background').css('display') === 'none') {
    $('#popup-background').css('display', 'block');
    $('#popup-outer').css('display', 'block');
  } else {
    $('#popup-background').css('display', 'none');
    $('#popup-outer').css('display', 'none');
  }
}

