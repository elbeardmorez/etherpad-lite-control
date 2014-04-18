
var groups = {};
var pads = {};

function epc_test() {
  console.log('[debug|epc_test]');
  epx_call();
}

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
  var arr = [ 'epc_server', 'epc_port', 'epc_apikeypath', 'epc_settingspath' ];
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

function epx_call(func, args, verbose, append) {
  console.log('[debug|epx_call]');
  if (func === undefined)
    var func = "test";
  if (args === undefined)
    var args = [];
  if (verbose === undefined)
    var verbose = true;
  if (append === undefined)
    var append = false;
  sSettingsPath = $('#epc_settingspath').attr('value');
  sData = '';
  jsonData = undefined;
  $.ajax({
    url: './etherpad-lite.php',
    type: 'POST',
    async: false,
    dataType: 'json',
    data: { 'func' : func,
            'args' : args,
            'settingsPath' : sSettingsPath },
    success: function(data, textStatus, jqXHR) {
      console.log('[debug|epx_call] success');
      sData = data['raw'];
      jsonData = data['data']['data'];
      if (jsonData === null && data['data']['code'] == 0)
        jsonData = true;
    },
    failure: function(data, textStatus, jqXHR) {
      console.log('[debug|epx_call] failure');
      sData = data['raw'];
    }
  });
  if (verbose)
    if (append)
      $('#epStatus-inner').append(sData);
    else
      $('#epStatus-inner').html(sData);
  return jsonData;
}

function ep_call(func, args, verbose, append) {
// console.log('[debug|ep_call]');
  if (func === undefined)
    var func = "checkToken";
  if (args === undefined)
    var args = [];
  if (verbose === undefined)
    var verbose = true;
  if (append === undefined)
    var append = false;
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
    success: function(data, textStatus, jqXHR) {
//      console.log('[debug|ep_call] success');
      sData = data['raw'];
      jsonData = data['data']['data'];
      if (jsonData === null && data['data']['code'] == 0)
        jsonData = true;
    },
    failure: function(data, textStatus, jqXHR) {
//      console.log('[debug|ep_call] failure');
      sData = data['raw'];
    }
  });
  if (verbose)
    if (append)
      $('#epStatus-inner').append(sData);
    else
      $('#epStatus-inner').html(sData);
  return jsonData;
}

function epc_status(verbose) {
  console.log('[debug|epc_status]');
  ep_call('checkToken', undefined, verbose);
}

function epc_content(verbose) {
  console.log('[debug|epc_content]');
  selected = $('#epPads :selected').map(function(){return this.value;}).get();
  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    var args = [selected[0]];
    jsonData = ep_call('getHTML', args, verbose);
    if (jsonData !== undefined) {
      $('#popupTitle').html(selected[0]);
      $('#popupContent').html(jsonData['html']);
      popupToggle('ok');
    }
  }
}

function epc_pads(verbose) {
  console.log('[debug|epc_pads]');
  jsonData = ep_call('listAllPads', undefined, verbose)

  // reset pads object
  pads = {};
  if (jsonData !== undefined) {
    // process
    if (jsonData['padIDs'].length > 0) {
      $.each(jsonData['padIDs'], function(idx, padID) {
        if (pads[padID] === undefined)
          pads[padID] = {'id': padID};
        var args = [padID]
        jsonData2 = ep_call('getPublicStatus', args, false);
        if (jsonData2 !== undefined && jsonData2 !== null) {
          if (jsonData2)
            pads[padID]['public'] = true;
          else
            pads[padID]['public'] = false;
        }
      });
      // update select control
      epc_padsType();
    }
  }
}
function epc_padsType(type) {
  console.log('[debug|epc_padsType]');

  if (type === undefined)
    type = $('#epPadsType').attr('value');
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
          jsonData = ep_call('deletePad', args, verbose);
          if (jsonData) {
            console.log('[info] deleted pad, id: \'' + value + '\'');
            delete(pads[value]);
          }
        });
        // reload pads
        epc_padsType();
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
  // reset groups object
  groups = {};
  jsonData = ep_call('listAllGroups', undefined, verbose)
  if (jsonData !== undefined) {
    // process
    if (jsonData['groupIDs'].length > 0) {
      $.each(jsonData['groupIDs'], function(idx, groupID) {
        if (groups[groupID] === undefined)
          groups[groupID] = {'id': groupID};
      });
    }
  }
  // map external names where possible
  jsonData = epx_call('getGroupMappers', undefined, true, true);
  if (jsonData !== undefined) {
    // process
    $.each(groups, function(key, group) {
      if (groups['name'] === undefined &&
        jsonData[key] !== undefined) {
        group['name'] = jsonData[key]['name'];
      }
    });
  }
  // update select control
  epc_groupsShow();
}
function epc_groupsShow() {
  console.log('[debug|epc_groupsShow]');
  $('#epGroups').html('');
  $.each(groups, function(key, group) {
    if (group['name'] === undefined)
      $('#epGroups').append('<option>[' + group['id'] + ']</option>');
    else
      $('#epGroups').append('<option>' + group['name'] + ' [' + group['id'] + ']</option>');
  });
  if ($('#epGroups')[0].length > 0) {
    $('#epGroups').prepend('<option value="0">All</option>');
    $('#epGroupsTitle').html('groups (' + ($('#epGroups')[0].length - 1) + ')');
  } else
    $('#epGroupsTitle').html('groups (0)');
}
function epc_groupsAdd(verbose) {
  console.log('[debug|epc_groupsAdd]');
  name = $('#epGroupName').attr('value');
  args = [name];
  jsonData = ep_call('createGroupIfNotExistsFor', args, verbose);
  if (jsonData !== null) {
//    gid = jsonData['groupID']; // api bug?
    gid = jsonData;
    group = groups[gid];
    if (group === undefined) {
      groups[gid] = { 'gid': gid, 'name': name };
      console.log('[info] group name \'' + name + '\' added with gid \'' + gid + '\'');
    } else
      console.log('[info] group name \'' + name + '\' already exists with gid \'' + gid + '\'');
  }
}
function epc_groupsRemove(verbose, data) {
  console.log('[debug|epc_groupsRemove]');
  selected = $('#epGroups :selected').map(function(){return this.value;}).get();
//  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_groupsRemove] confirmation message');
      $('#popupTitle').html('warning: confirmation required');
      suffix = ''
      if (selected.length > 1)
        suffix = 's';
      sMessage = '<p>are you sure you want to permanently remove the following group' + suffix + ':</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      // set the click handler
      $('#popup-button-ok').off("click");
      $('#popup-button-ok').on('click', function() {epc_groupsRemove(true, true);});
      popupToggle('yes|no');
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        selectedIndex = $("#epGroups option:selected")[0].index;
        $.each(selected, function(key, value) {
          var groupID =value.match('.*\\[(.*)\\].*')[1];
          var args = [groupID];
          jsonData = ep_call('deleteGroup', args, verbose);
          if (jsonData) {
            console.log('[info] deleted group, id: \'' + groupID + '\'');
            delete(groups[groupID]);
          }
        });
        // reload group
        epc_groupsShow();
        // reselect
        if (selectedIndex > $('#epGroups')[0].length)
          selectedIndex = $('#epGroups')[0].length;
        $('#epGroups')[0].selectedIndex = selectedIndex;
      }
    }
  }
}

function epc_authors(verbose) {
  console.log('[debug|epc_authors]');
  jsonData = ep_call('listAllPads', undefined, false);
  authors = {};
  authorNames = {};
  $('#epStatus-inner').html('');
  if (jsonData !== undefined) {
    $.each(jsonData['padIDs'], function(idx, padID) {
      var args = [padID];
      jsonData2 = ep_call('listAuthorsOfPad', args, true, true);
      if (jsonData2 !== undefined) {
        $.each(jsonData['authorIDs'], function(idx2, authorID) {
          var authorName = authorNames[authorID];
          if (authorName === undefined) {
            var args2 = [authorID];
            jsonData3 = undefined;
            jsonData3 = ep_call('getAuthorName', args2, true, true);
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

