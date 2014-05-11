
var authors = undefined;
var groups = undefined;
var pads = undefined;
var sessions = undefined;

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
    $('#' + sElement).attr('value', getCookie(sElement));
  }
}

function getServer() {
  return $('#epc_server').attr('value') + ":" +
         $('#epc_port').attr('value') +
         ($('#epc_basepath').attr('value') ? "/" +
          $('#epc_basepath').attr('value') : "");
}

/*
 return 'undefined' for erroneous and unsuccessful. 'null' used for successful queries, e.g. empty lists
*/
function epx_call(func, args, verbose, append) {
//  console.log('[debug|epx_call]');

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
      if (data['data']['code'] == 0 || typeof data['data']['code'] == "object")
        jsonData = data['data']['data'];
    },
    failure: function(data, textStatus, jqXHR) {
      sData = '[debug|epx_call] failure';
      console.log(sData);
    }
  });
  if (verbose)
    if (append)
      $('#epStatus-inner').append('<br>' + sData);
    else
      $('#epStatus-inner').html('<br>' + sData);
  return jsonData;
}

/*
 return 'undefined' for erroneous and unsuccessful. 'null' used for successful queries, e.g. empty lists
*/
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
      console.log('[debug|ep_call] success');
      sData = data['raw'];
      if (data['data']['code'] == 0)
        jsonData = data['data']['data'];
    },
    failure: function(data, textStatus, jqXHR) {
      sData = '[debug|ep_call] failure';
      console.log(sData);
    }
  });
  if (verbose)
    if (append)
      $('#epStatus-inner').append('<br>' + sData);
    else
      $('#epStatus-inner').html('<br>' + sData);
  return jsonData;
}

function epc_status(verbose) {
  console.log('[debug|epc_status]');
  ep_call('checkToken', undefined, verbose);
}
function epc_clean(verbose) {
  console.log('[debug|epc_clean]');

  jsonData = epx_call('cleanDatabase', undefined, verbose);
  if (jsonData !== undefined && jsonData !== null) {
    // process
    sMessage = '';
    $.each(jsonData, function(idx, data) {
      if (data['info'] != '')
        sMessage += '<li>' + data['info'] + '</li>\n';
    });
    if (sMessage == '')
      sMessage = '<p>nothing to do!</p>';
    else
      sMessage = '<ul>\n' + sMessage + '</ul>\n';
    $('#popupTitle').html('Database clean-up');
    $('#popupContent').html(sMessage);
    popupToggle();
  }
}

//
// pads
//

function epc_padName2Id(data) {
  // display string to id

  id = data;
  if (matches = id.match(/(.*?) \[(.*)\]/)) {
    // group name to id
    if (groups !== undefined) {
      group = groups[matches[2]];
      if (group !== undefined)
        id = matches[2] + "$" + matches[1];
      else
        // resolve name to id?
        id = $.map(groups, function(group) { if (group['name'] == matches[2]) return group['id']; }).join('') + "$" + matches[1];
    } else
      id = matches[2] + "$" + matches[1];
  }
  return id;
}

function epc_pads(data, verbose) {
  console.log('[debug|epc_pads]');

  if (data === undefined)
    var data = 'global';

  selected = $('#epPads :selected').map(function(){return this.value;}).get();
  var jsonData = [];
  var result;
  switch (data) {
    case 'global':
      var func = 'listAllPads';
      var args = [];
      result = ep_call(func, args, verbose);
      if (result !== undefined && result !== null)
        jsonData.push(result);
      break;
    case 'group':
      selectedGids = $('#epGroups :selected').map(function(){return this.value;}).get();
      if (selectedGids.length > 0) {
        var func = "listPads";
        $.each(selectedGids, function(idx, sGid) {
          var args = [sGid.match('.*\\[(.*)\\].*')[1]];
          result = ep_call(func, args, verbose);
          if (result !== undefined && result !== null)
            jsonData.push(result);
        });
      }
      break;
  }

  // reset pads object
  pads = {};
  $('#epPads').html('');
  if (jsonData.length > 0) {
    // process
    $.each(jsonData, function(idx, result) {
      if (result['padIDs'].length > 0) {
        $.each(result['padIDs'], function(idx2, id) {
          if (pads[id] === undefined)
            pads[id] = {'id': id, 'name': id};
          var args = [id]
          var result2 = ep_call('getPublicStatus', args, false);
          if (result2 !== undefined) {
            // group pad
            if (result2)
              pads[id]['public'] = true;
            else
              pads[id]['public'] = false;
            if (pads[id]['name'] == pads[id]['id']) {
              // modify name
              var arr = pads[id]['id'].match('(.*)\\$(.*)');
              var name = arr[2];
              var gid = arr[1];
              if (groups !== undefined)
                pads[id]['name'] = name + ' [' + groups[gid]['name'] + ']';
              else
                pads[id]['name'] = name + ' [' + gid + ']';
            }
          }
        });
      }
    });
    // update select control
    epc_padsShow();
  }
  // reselect selected
  $.each(selected, function(idx, sPad) {
    id = epc_padName2Id(sPad);
    $('#epPads option:contains(' + pads[id]['name'] + ')').attr('selected', 'selected');
  });
}
function epc_padsShow(type) {
  console.log('[debug|epc_padsShow]');

  if (type === undefined)
    type = $('#epPadsType').attr('value');
  switch (type) {
    case "group (private)":
      console.log("[debug|epc_padsShow] selected private group pads");
      break;
    case "group (public)":
      console.log("[debug|epc_padsShow] selected public group pads");
      break;
    case "regular":
      console.log("[debug|epc_padsShow] selected regular pads");
      break;
  }
  $('#epPads').html('');
  $.each(pads, function(idx, pad) {
    switch (type) {
      case "group (private)":
        if (pad['public'] !== undefined && pad['public'] !== true)
          $('#epPads').append('<option>' + pad['name'] + '</option>');
        break;
      case "group (public)":
        if (pad['public'] !== undefined && pad['public'] === true)
          $('#epPads').append('<option>' + pad['name'] + '</option>');
        break;
      case "regular":
        if (pad['public'] === undefined)
          $('#epPads').append('<option>' + pad['name'] + '</option>');
        break;
    }
  });

  if ($('#epPads')[0].length > 0) {
    $('#epPads').prepend('<option value="All">All</option>');
    $('#epPadsTitle').html('pads (' + ($('#epPads')[0].length - 1) + ')');
  } else
    $('#epPadsTitle').html('pads (0)');
}
function epc_padsAdd(verbose, data) {
  console.log('[debug|epc_padsAdd]');

  var func = '';
  var args = [];
  var name = $('#epPadName').attr('value');

  selected = $('#epGroups :selected').map(function() { return this.value; }).get();
  if (selected.length > 0) {
    // create a group pad
    func = 'createGroupPad';
    args = [selected[0].match('.*\\[(.*)\\].*')[1], name];
  } else {
    // create a regular pad
    func = 'createPad';
    args = [name];
  }
  jsonData = ep_call(func, args, verbose);
  if (jsonData !== undefined) {
    if (jsonData === null) {
      if (pads === undefined)
        pads = {};
      pad = pads[name];
      if (pad === undefined) {
        pad[name] = { 'id': name };
        console.log('[info] pad name \'' + name + '\' added');
      } else
        console.log('[info] pad name \'' + name + '\' already exists');
    }
  }

  // reload group
  epc_padsShow();
  // select added / existing
  $('#epPads option:contains(' + name + ')').attr('selected', 'selected');
  // update info
  epc_padsInfo();
}
function epc_padsRemove(verbose, data) {
  console.log('[debug|epc_padsRemove]');

  selected = $('#epPads :selected').map(function(){return this.value;}).get();
//  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
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
          if (jsonData !== undefined && jsonData['affected'] == 1) {
            console.log('[info] deleted pad, id: \'' + value + '\'');
            delete(pads[value]);
          } else
            console.log('[debug] issue deleting pad, id: \'' + value + '\'');
        });
        // reload pads
        epc_padsShow();
        // reselect
        if (selectedIndex > $('#epPads')[0].length)
          selectedIndex = $('#epPads')[0].length;
        $('#epPads')[0].selectedIndex = selectedIndex;
        // update info
        epc_padsInfo();
      }
    }
  }
}
function epc_padContent(verbose) {
  console.log('[debug|epc_padContent]');

  selected = $('#epPads :selected').map(function(){return this.value;}).get();
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
function epc_padsInfo(verbose) {
  console.log('[debug|epc_padsInfo]');

  // get selected id
  selected = $('#epPads :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    id = epc_padName2Id(selected[0]);
    pad = pads[id];
    if (pad === undefined) {
      if (id != 'All')
        console.log('[debug] broken pad reference key');
      return;
    }

    var props = ['name', 'created', 'updated'];
    var infos = {};
    infos['created'] = [ 'nonapi', 'getPadCreated', [ id ], 'created' ];
    infos['updated'] = [ 'api', 'getLastEdited', [ id ], 'lastEdited' ];

    if (pad['created'] === undefined) {
      // collect info strings
      var append = false;
      $.each(infos, function(key, info) {
        var type = info[0];
        var func = info[1];
        var args = info[2];
        var dataKey = info[3];

        if (type == "api")
          jsonData = ep_call(func, args, verbose, append);
        else
          jsonData = epx_call(func, args, verbose, append);
        append = true;

        if (jsonData !== undefined) {
          // add info to pad object
          pad[key] = jsonData[dataKey];
          // post processing
          switch (key) {
            case 'created':
            case 'updated':
              // convert date
              pad[key] = getDateString(new Date(pad[key]));
              break;
          }
        }
      });
    }
    // construct html
    html = '';
    $.each(props, function(idx, prop) {
      html += "<p style='margin: 3px 0px 2px; font-size: 0.8em;'><b>" + prop + ": </b><span style='font-size: 1.1em;'>" + ( pad[prop] !== undefined ? pad[prop] : '') + "</span></p>"
    });
    $('#epInfo-inner').html(html);
    $('#epInfo-title').html('info (pad)');
  }
}

//
// sessions
//

function epc_sessions(verbose) {
  console.log('[debug|epc_sessions]');

  // reset sessions object
  sessions = {};
  jsonData = epx_call('listAllSessions', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null) {
    sessions = jsonData;
  }
  // update select control
  epc_sessionsShow();
}
function epc_sessionsShow() {
  console.log('[debug|epc_sessionsShow]');

  $('#epSessions').html('');
  $.each(sessions, function(key, session) {
    $('#epSessions').append('<option>' + session['id'] + '</option>');
  });
  if ($('#epSessions')[0].length > 0) {
    $('#epSessions').prepend('<option value="All">All</option>');
    $('#epSessionsTitle').html('sessions (' + ($('#epSessions')[0].length - 1) + ')');
  } else
    $('#epSessionsTitle').html('sessions (0)');

}
function epc_sessionsAdd(verbose) {
  console.log('[debug|epc_sessionsAdd]');

  var aAuthors = $('#epAuthors :selected').map(function() { return this.value; }).get();
  var aGroups = $('#epGroups :selected').map(function() { return this.value; }).get();
  if (aAuthors.length == 0) {
    alert("[user] no author(s) selected");
    return;
  }
  if (aGroups.length == 0) {
    alert("[user] no pad group(s) selected");
    return;
  }

  var expiry = $('#epSessionExpiry').val();
  if (expiry === undefined || expiry == '') {
    // default to 'infinity'
    expiry = sessionExpiry(10, "year(s)");
  } else {
    expiry = expiry.match('\s*([0-9]+(?:\.[0-9]+|))\s*');
    if (expiry === null) {
      alert("[user] non-numeric session expiry specified");
      return;
    } else
      expiry = sessionExpiry($('#epSessionExpiry').val(), $('#epSessionExpiry2').val());
  }

  // create session(s) for author <-> group-pad(s)
  $('#epStatus-inner').html('');
  var id = '';
  $.each(aAuthors, function(idx, author) {
    var aid = author.match('.*\\[(.*)\\].*')[1];
    $.each(aGroups, function(idx, group) {
      var gid = group.match('.*\\[(.*)\\].*')[1];
      args = [gid, aid, expiry];
      jsonData = ep_call('createSession', args, verbose, true);
      if (jsonData !== undefined) {
        id = jsonData['sessionID'];
        if (sessions === undefined)
          sessions = {};
        session = sessions[id];
        if (session === undefined) {
          sessions[id] = { 'id': id };
          console.log('[info] session added with id \'' + id + '\'');
        } else {
          console.log('[info] session already exists with id \'' + id + '\'');
        }
      }
    });
  });

  // reload session
  epc_sessionsShow();
  // select added / existing
  $('#epSessions option:contains(' + id + ')').attr('selected', 'selected');
  // update info
  epc_sessionsInfo();

}
function epc_sessionsRemove(verbose, data) {
  console.log('[debug|epc_sessionsRemove]');

  selected = $('#epSessions :selected').map(function(){return this.value;}).get();
//  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_sessionsRemove] confirmation message');
      $('#popupTitle').html('warning: confirmation required');
      suffix = '';
      if (selected.length > 1)
        suffix = 's';
      sMessage = '<p>are you sure you want to permanently remove the following session' + suffix + ':</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      // set the click handler
      $('#popup-button-ok').off("click");
      $('#popup-button-ok').on('click', function() {epc_sessionsRemove(true, true);});
      popupToggle('yes|no');
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        selectedIndex = $("#epSessions option:selected")[0].index;
        $.each(selected, function(idx, id) {
          var args = [id];
          jsonData = ep_call('deleteSession', args, verbose);
          if (jsonData !== undefined && jsonData['affected'] == 1) {
            console.log('[info] deleted session, id: \'' + id + '\'');
            delete(sessions[id]);
          } else
            console.log('[debug] issue deleting session, id: \'' + id + '\'');
        });
        // reload session
        epc_sessionsShow();
        // reselect
        if (selectedIndex > $('#epSessions')[0].length - 1)
          selectedIndex = $('#epSessions')[0].length - 1;
        $('#epSessions')[0].selectedIndex = selectedIndex;
        // update info
        epc_sessionsInfo();
      }
    }
  }
}
function epc_sessionsInfo(verbose) {
  console.log('[debug|epc_sessionsInfo]');

  // get selected id
  selected = $('#epSessions :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    id = selected[0];
    session = sessions[id];
    if (session === undefined) {
      if (id != 'All')
        console.log('[debug] broken session reference key');
      return;
    }

    var props = ['id', 'author', 'group', 'expiry'];

    // ensure info
    if (session['authorID'] === undefined) {
      jsonData = ep_call('getSessionInfo', [id], verbose, true);
      if (jsonData !== undefined) {
        $.each(jsonData, function(key, value) {
          // add info to session object
          session[key] = value;
        });
      }
    }
    $.each(props, function(idx, prop) {
      switch (prop) {
        case 'author':
          if (session['author'] === undefined || session['author'] == session['authorID']) {
            session['author'] = session['authorID'];
            if (authors !== undefined) {
              // resolve id
              author = authors[session['authorID']];
              if (author !== undefined)
                session['author'] = author['name'] + ' [' + author['id'] + ']';
            }
          }
          break;
        case 'group':
          if (session['group'] === undefined || session['group'] == session['groupID']) {
            session['group'] = session['groupID'];
            if (groups !== undefined) {
              // resolve id
              group = groups[session['groupID']];
              if (group !== undefined)
                session['group'] = group['name'] + ' [' + group['id'] + ']';
            }
          }
          break;
        case 'expiry':
          if (session['expiry'] === undefined)
            // convert date
            session['expiry'] = getDateString(new Date(session['validUntil']));
          break;
      }
    });

    // build html
    var sessionHTML = {};
    var propHTMLSuffix = "<span style='font-size: 1.1em;'>"
    var propHTMLPostfix = "</span>";

    $.each(props, function(idx, prop) {
      switch (prop) {
        case 'expiry':
          if (session['validUntil'] < Date.now())
            // comparison is in UTC
            sessionHTML[prop] = '<span style="color: red; font-size: 1.1em;">' + session[prop] + '</span>';
          break;
      }
    });

    // construct html
    html = '';
    $.each(props, function(idx, prop) {
      html += '<p style="margin: 3px 0px 2px; font-size: 0.8em;"><b>' + prop + ': </b>' + (sessionHTML[prop] ? sessionHTML[prop] : propHTMLSuffix + (session[prop] ? session[prop] : '') + propHTMLPostfix) + '</p>';
    });
    $('#epInfo-inner').html(html);
    $('#epInfo-title').html('info (session)');
  }
}

//
// groups
//

function epc_groups(verbose) {
  console.log('[debug|epc_groups]');

  // reset groups object
  groups = {};
  jsonData = ep_call('listAllGroups', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null) {
    // process
    if (jsonData['groupIDs'].length > 0) {
      $.each(jsonData['groupIDs'], function(idx, id) {
        if (groups[id] === undefined)
          groups[id] = {'id': id};
      });
    }
  }
  // map external names where possible
  jsonData = epx_call('getGroupMappers', undefined, true, true);
  if (jsonData !== undefined && jsonData !== null) {
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
  // update pads list
  if (pads !== undefined)
    epc_pads();
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
    $('#epGroups').prepend('<option value="All">All</option>');
    $('#epGroupsTitle').html('groups (' + ($('#epGroups')[0].length - 1) + ')');
  } else
    $('#epGroupsTitle').html('groups (0)');
}
function epc_groupsAdd(verbose) {
  console.log('[debug|epc_groupsAdd]');

  name = $('#epGroupName').attr('value');
  args = [name];
  jsonData = ep_call('createGroupIfNotExistsFor', args, verbose);
  if (jsonData !== undefined) {
    id = jsonData['groupID'];
    if (groups === undefined)
      groups = {};
    group = groups[id];
    if (group === undefined) {
      groups[id] = { 'id': id, 'name': name };
      console.log('[info] group name \'' + name + '\' added with id \'' + id + '\'');
    } else
      console.log('[info] group name \'' + name + '\' already exists with id \'' + id + '\'');

    // reload group
    epc_groupsShow();
    // select added / existing
    $('#epGroups option:contains(' + id + ')').attr('selected', 'selected');
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
          var id = value.match('.*\\[(.*)\\].*')[1];
          var args = [id];
          jsonData = ep_call('deleteGroup', args, verbose);
          if (jsonData !== undefined && jsonData['affected'] == 1) {
            console.log('[info] deleted group, id: \'' + id + '\'');
            delete(groups[id]);
          } else
            console.log('[debug] issue deleting group, id: \'' + id + '\'');
        });
        // reload group
        epc_groupsShow();
        // reselect
        if (selectedIndex > $('#epGroups')[0].length - 1)
          selectedIndex = $('#epGroups')[0].length - 1;
        $('#epGroups')[0].selectedIndex = selectedIndex;
      }
    }
  }
}
function epc_groupPads(verbose) {
  console.log('[debug|epc_groupPads]');
  epc_pads('group');
}
function epc_groupAuthors(verbose) {
  console.log('[debug|epc_groupAuthors]');
  epc_authors('group');
}

//
// authors
//

function epc_authors(verbose) {
  console.log('[debug|epc_authors]');

  // reset authors object
  authors = {};
  jsonData = epx_call('listAllAuthors', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null)
    // process
    authors = jsonData;
  // map external names where possible
  jsonData = epx_call('getAuthorMappers', undefined, true, true);
  if (jsonData !== undefined && jsonData !== null) {
    // process
    $.each(authors, function(key, author) {
      if (authors['name'] === undefined &&
        jsonData[key] !== undefined) {
        author['name'] = jsonData[key]['name'];
      }
    });
  }
  // update select control
  epc_authorsShow();
}

function epc_authorsOfPads(data, verbose) {
  console.log('[debug|epc_authors]');

  if (data === undefined)
    var data = 'global';

  var jsonData = undefined;
  switch (data) {
    case 'global':
      var func = 'listAllPads';
      var args = [];
      jsonData = ep_call(func, args, false);
      break;
    case 'group':
      selected = $('#epGroups :selected').map(function(){return this.value;}).get();
      if (selected.length > 0) {
        var func = "listPads";
        var gid = selected[0].match('.*\\[(.*)\\].*')[1];
        var args = [gid];
        jsonData = ep_call(func, args, false);
      }
      break;
  }
  // reset authors object
  authors = {};
  // temp 'dictionary' for name mappings to avoid unnecessary
  // (and very slow) api calls to 'getAuthorName'
  var auth2name = {};
  $('#epStatus-inner').html('');
  if (jsonData !== undefined && jsonData !== null) {
    $.each(jsonData['padIDs'], function(idx, pid) {
      var args = [pid];
      jsonData2 = ep_call('listAuthorsOfPad', args, true, true);
      if (jsonData2 !== undefined && jsonData2 !== null) {
        $.each(jsonData2['authorIDs'], function(idx2, id) {
          authors[id] = { 'id': id };
          var name = auth2name[id];
          if (name === undefined) {
            var args2 = [id];
            jsonData3 = undefined;
            jsonData3 = ep_call('getAuthorName', args2, true, true);
            if (jsonData3 !== undefined) {
//              name = jsonData3['authorName']; // api bug?
              name = jsonData3;
              authors[id]['name'] = name;
            }
          }
        });
      }
    });
  }
  // update select control
  epc_authorsShow();
}

function epc_authorsShow() {
  console.log('[debug|epc_authorsShow]');

  $('#epAuthors').html('');
  $.each(authors, function(key, author) {
    if (author['name'] === undefined)
      $('#epAuthors').append('<option>[' + author['id'] + ']</option>');
    else
      $('#epAuthors').append('<option>' + author['name'] + ' [' + author['id'] + ']</option>');
  });
  if ($('#epAuthors')[0].length > 0) {
    $('#epAuthors').prepend('<option value="All">All</option>');
    $('#epAuthorsTitle').html('authors (' + ($('#epAuthors')[0].length - 1) + ')');
  } else
    $('#epAuthorsTitle').html('authors (0)');
}
function epc_authorsAdd(verbose) {
  console.log('[debug|epc_authorsAdd]');

  name = $('#epAuthorName').attr('value');
  args = [name, name];
  jsonData = ep_call('createAuthorIfNotExistsFor', args, verbose);
  if (jsonData !== undefined) {
    id = jsonData['authorID'];
    if (authors === undefined)
      authors = {};
    author = authors[id];
    if (author === undefined) {
      authors[id] = { 'id': id, 'name': name };
      console.log('[info] author name \'' + name + '\' added with id \'' + id + '\'');
    } else
      console.log('[info] author name \'' + name + '\' already exists with id \'' + id + '\'');

    // reload author
    epc_authorsShow();
    // select added / existing
    $('#epAuthors option:contains(' + id + ')').attr('selected', 'selected');
  }
}
function epc_authorsRemove(verbose, data) {
  console.log('[debug|epc_authorsRemove]');

  selected = $('#epAuthors :selected').map(function(){return this.value;}).get();
//  console.log('selected #: ' + selected.length + ', @: ' + selected.join(", "));
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_authorsRemove] confirmation message');
      $('#popupTitle').html('warning: confirmation required');
      suffix = ''
      if (selected.length > 1)
        suffix = 's';
      sMessage = '<p>are you sure you want to permanently remove the following author' + suffix + ':</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      // set the click handler
      $('#popup-button-ok').off("click");
      $('#popup-button-ok').on('click', function() {epc_authorsRemove(true, true);});
      popupToggle('yes|no');
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        selectedIndex = $("#epAuthors option:selected")[0].index;
        $.each(selected, function(key, value) {
          var id = value.match('.*\\[(.*)\\].*')[1];
          var args = [id];
          jsonData = epx_call('deleteAuthor', args, verbose);
          if (jsonData !== undefined && jsonData['affected'] == 1) {
            console.log('[info] deleted author, id: \'' + id + '\'');
            delete(authors[id]);
          } else
            console.log('[debug] issue deleting author, id: \'' + id + '\'');
        });
        // reload author
        epc_authorsShow();
        // reselect
        if (selectedIndex > $('#epAuthors')[0].length - 1)
          selectedIndex = $('#epAuthors')[0].length - 1;
        $('#epAuthors')[0].selectedIndex = selectedIndex;
      }
    }
  }
}

function sessionExpiry(quantity, unit) {

  var expiry;

  if (quantity === undefined || quantity == '') {
    expiry = undefined;
  } else {
    var multiplier = 1;
    var dNow = new Date();
    switch (unit) {
      case 'year(s)':
      case 'month(s)':
      case 'week(s)':
        // convert quantity to days
        var dExpiry = new Date();
        var dExpiry2 = new Date();
        var days = 0;
        switch (unit) {
          case 'year(s)':
            dExpiry2 = new Date(dExpiry.toUTCString());
            dExpiry.setYear(dExpiry.getFullYear() + Math.floor(quantity));
            quantity = quantity - Math.floor(quantity);
            if (quantity > 0)
              quantity *= 12;
            days += Math.round((Date.UTC(dExpiry.getFullYear(), dExpiry.getMonth(), dExpiry.getDate()) - Date.UTC(dExpiry2.getFullYear(), dExpiry2.getMonth(), dExpiry2.getDate())) / (1000 * 60 * 60 * 24));
          case 'month(s)':
            dExpiry2 = new Date(dExpiry.toUTCString());
            dExpiry.setMonth(dExpiry.getMonth() + Math.floor(quantity));
            quantity = quantity - Math.floor(quantity);
            if (quantity > 0)
              quantity *= ((new Date(dExpiry.getFullYear(), dExpiry.getMonth() + 1, 1) - new Date(dExpiry.getFullYear(), dExpiry.getMonth(), 1)) / (1000 * 60 * 60 * 24));
            days += Math.round((Date.UTC(dExpiry.getFullYear(), dExpiry.getMonth(), dExpiry.getDate()) - Date.UTC(dExpiry2.getFullYear(), dExpiry2.getMonth(), dExpiry2.getDate())) / (1000 * 60 * 60 * 24));
            break;
          case 'week(s)':
            days += quantity * 7;
            break;
        }
        quantity = days;
      case 'day(s)':
        multiplier *= 24;
      case 'hour(s)':
        multiplier *= 60;
      case 'minute(s)':
        multiplier *= 60;
        break;
    }
    expiry = Date.UTC(dNow.getUTCFullYear(), dNow.getUTCMonth(), dNow.getUTCDate(), dNow.getUTCHours(), dNow.getUTCMinutes(), dNow.getUTCSeconds() ) + Math.ceil(quantity * multiplier) * 1000;
  }
  return expiry;
}

function getDateString(dt) {
  var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
  return ("0" + dt.getDate() + " " + months[dt.getMonth()] + " " + dt.getFullYear() + " 0" + dt.getHours() + ":0" + dt.getMinutes() + ":0"+ dt.getSeconds()).replace(/(^|\ |:)+0([0-9]{2})/g, "$1$2");
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

function selectAll(select) {
  $.each(select.options, function(idx, option) {
    option.selected = true;
  });
  //select.options[0].selected = false; // assumption on position
  //$('#' + select.id +  ' option:contains(\'All\')').attr('selected', false); // loose match
  //$('option[value=All]', select).attr('selected', false);  // multiple exact matches set
  $('option[value=All]', select)[0].selected = false;  // first and only exact match set
}

