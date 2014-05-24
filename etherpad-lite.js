
// global containers
var authors;
var groups;
var pads;
var sessions;

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
    var lStart = document.cookie.indexOf(sName + "=");
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
    $('#' + sElement).val(getCookie(sElement));
  }
}

function getServer() {
  return $('#epc_server').val() + ":" +
         $('#epc_port').val() +
         ($('#epc_basepath').val() ? "/" +
          $('#epc_basepath').val() : "");
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

  var sSettingsPath = $('#epc_settingspath').val();
  var sData = '';
  var jsonData;
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
  if (verbose) {
    if (append)
      $('#epStatus-inner').append('<br>' + sData);
    else
      $('#epStatus-inner').html('<br>' + sData);
  }
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
  var sServer = getServer();
  var sApiKeyPath = $('#epc_apikeypath').val();
  var sData = '';
  var jsonData;
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
  if (verbose) {
    if (append)
      $('#epStatus-inner').append('<br>' + sData);
    else
      $('#epStatus-inner').html('<br>' + sData);
  }
  return jsonData;
}

function epc_status(verbose) {
  console.log('[debug|epc_status]');
  ep_call('checkToken', undefined, verbose);
}

function epc_clean(verbose) {
  console.log('[debug|epc_clean]');

  var jsonData = epx_call('cleanDatabase', undefined, verbose);
  if (jsonData !== undefined && jsonData !== null) {
    // process
    var sMessage = '';
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

  var id = data;
  if (matches = id.match(/(.*?) \[(.*)\]/)) {
    // group name to id
    if (groups !== undefined) {
      var group = groups[matches[2]];
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

  // remember current selection
  var selected = $('#epPads :selected').map(function(){return this.value;}).get();

  var jsonData = [];
  var res;
  switch (data) {
    case 'global':
      var func = 'listAllPads';
      var args = [];
      res = ep_call(func, args, verbose);
      if (res !== undefined && res !== null)
        jsonData.push(res);
      break;
    case 'group':
      selectedGids = $('#epGroups :selected').map(function(){return this.value;}).get();
      if (selectedGids.length > 0) {
        var func = "listPads";
        var args = [];
        $.each(selectedGids, function(idx, gid) {
          args = [gid];
          res = ep_call(func, args, verbose);
          if (res !== undefined && res !== null)
            jsonData.push(res);
        });
      }
      break;
  }

  // reset pads object
  pads = {};
  if (jsonData.length > 0) {
    // process
    $.each(jsonData, function(idx, result) {
      if (result['padIDs'].length > 0) {
        $.each(result['padIDs'], function(idx2, id) {
          if (pads[id] === undefined)
            pads[id] = {'id': id, 'name': id};
          var pad = pads[id];
          var args = [id]
          var res2 = ep_call('getPublicStatus', args, false);
          if (res2 === undefined)
            // regular pad
            pad['type'] = 'regular';
          else {
            // group pad
            // set public status
            if (res) {
              pad['public'] = true;
              pad['type'] = 'public group';
            } else {
              pad['public'] = false;
              pad['type'] = 'private group';
            }
            if (pad['name'] == pad['id']) {
              // modify name
              var arr = pad['id'].match('(.*)\\$(.*)');
              var name = arr[2];
              var gid = arr[1];
              pad['name'] = name + ' [' + (groups !== undefined ? groups[gid]['name'] : gid) + ']';
            }
          }
        });
      }
    });

    // update select control
    epc_padsShow();
    // reselect selected
    $.each(selected, function(idx, id) {
      $('#epPads option[value="' + id + '"]').attr('selected', true);
    });
  } else
    $('#epPads').html('');
}

function epc_padsShow(type) {
  console.log('[debug|epc_padsShow]');

  if (type === undefined)
    type = $('#epPadsType').val();
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
        if (pad['type'] === 'private group')
          $('#epPads').append('<option value="' + pad['id'] + '">' + pad['name'] + '</option>');
        break;
      case "group (public)":
        if (pad['type'] === 'public group')
          $('#epPads').append('<option value="' + pad['id'] + '">' + pad['name'] + '</option>');
        break;
      case "regular":
        if (pad['type'] === 'regular')
          $('#epPads').append('<option value="' + pad['id'] + '">' + pad['name'] + '</option>');
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
  var name = $('#epPadName').val();

  selectedGids = $('#epGroups :selected').map(function() { return this.value; }).get();
  if (selectedGids.length > 0) {
    // create a group pad
    func = 'createGroupPad';
    args = [selectedGids[0], name];
  } else {
    // create a regular pad
    func = 'createPad';
    args = [name];
  }
  var jsonData = ep_call(func, args, verbose);
  if (jsonData !== undefined) {
    if (jsonData === null) {
      if (pads === undefined)
        pads = {};
      var pad = pads[name];
      if (pad === undefined) {
        pads[name] = { 'id': name, 'name': name };
        console.log('[info] pad name \'' + name + '\' added');
      } else
        console.log('[info] pad name \'' + name + '\' already exists');
    }
  }

  // reload group
  epc_padsShow();
  // select added / existing
  $('#epPads option[value="' + name + '"]').attr('selected', true);
  // update info
  epc_padsInfo();
}

function epc_padsRemove(verbose, data) {
  console.log('[debug|epc_padsRemove]');

  var selected = $('#epPads :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_padsRemove] confirmation message');
      var sMessage = '<p>are you sure you want to delete the following pads</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      popupToggle('info', 'yes|no', [function() {epc_padsRemove(true, true);}]);
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        var selectedIndex = $("#epPads option:selected")[0].index;
        $.each(selected, function(key, value) {
          var args = [value];
          var jsonData = ep_call('deletePad', args, verbose);
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

  var selected = $('#epPads :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {
    var args = [selected[0]];
    var jsonData = ep_call('getHTML', args, verbose);
    if (jsonData !== undefined) {
      $('#popupTitle').html(selected[0]);
      $('#popupContent').html(jsonData['html']);
      popupToggle();
    }
  }
}

function epc_padsInfo(verbose) {
  console.log('[debug|epc_padsInfo]');

  var selected = $('#epPads :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    var id = selected[0];
    var pad = pads[id];
    if (pad === undefined) {
      if (id != 'All')
        console.log('[debug] broken pad reference key');
      return;
    }

    var props = ['name', 'created', 'updated', 'type', 'author(s)']
    var infos = {};
    infos['created'] = [ 'nonapi', 'getPadCreated', [ id ], 'created' ];
    infos['updated'] = [ 'api', 'getLastEdited', [ id ], 'lastEdited' ];
    infos['author(s)'] = [ 'api', 'listAuthorsOfPad', [ id ], 'authorIDs' ];

    // collect info strings
    var append = false;
    $.each(props, function(idx, prop) {

      var bUpdate = true;
      var bProcess = true;

      // pre-processing
      switch (prop) {
        case 'created':
        case 'updated':
          if (pad['created'] !== undefined)
            bUpdate = bProcess = false;
          break;
        case 'author(s)':
          if (pad['authors'] !== undefined)
            bUpdate = false;
          break;
      }

      if (bUpdate && infos[prop] !== undefined) {
        var info = infos[prop];
        var type = info[0];
        var func = info[1];
        var args = info[2];
        var dataKey = info[3];

        var jsonData;
        if (type === "api")
          jsonData = ep_call(func, args, verbose, append);
        else
          jsonData = epx_call(func, args, verbose, append);
        // append any further status messages
        append = true;
        if (jsonData !== undefined)
          // add info to pad object
          pad[prop] = jsonData[dataKey];
      }

      if (bProcess) {
        // post processing
        switch (prop) {
          case 'created':
          case 'updated':
            // convert date
            pad[prop] = getDateString(new Date(pad[prop]));
            break;
          case 'author(s)':
            if (pad[prop] !== undefined) {
              if ($.isArray(pad[prop]))
                // flatten
                pad[prop] = pad[prop].map(function(s){return '? [' + s + ']';}).join(', ');
              if (authors !== undefined && pad[prop].match(/\?/))
                // resolve unresolved
                pad[prop] = pad[prop].split(',').map(function(s){ var author = authors[s.match(/^.*?\[(.*?)\]\s*$/)[1]]; return (author !== undefined ? author['name'] + ' [' + author['id'] + ']' : s.trim()); }).join(', ');
            }
            break;
        }
      }
    });

    // construct html
    var html = '';
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

  // remember current selection
  var selected = $('#epSessions :selected').map(function(){return this.value;}).get();

  // reset sessions object
  sessions = {};

  var jsonData = epx_call('listAllSessions', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null) {
    sessions = jsonData;
  }

  // update select control
  epc_sessionsShow();
  // reselect selected
  $.each(selected, function(idx, id) {
    $('#epSessions option[value="' + id + '"]').attr('selected', true);
  });
}

function epc_sessionsShow() {
  console.log('[debug|epc_sessionsShow]');

  $('#epSessions').html('');
  $.each(sessions, function(key, session) {
    $('#epSessions').append('<option value="' + session['id'] + '">' + session['id'] + '</option>');
  });
  if ($('#epSessions')[0].length > 0) {
    $('#epSessions').prepend('<option value="All">All</option>');
    $('#epSessionsTitle').html('sessions (' + ($('#epSessions')[0].length - 1) + ')');
  } else
    $('#epSessionsTitle').html('sessions (0)');
}

function epc_sessionsAdd(verbose) {
  console.log('[debug|epc_sessionsAdd]');

  var selectedAids = $('#epAuthors :selected').map(function() { return this.value; }).get();
  if (selectedAids.length == 0) {
    alert("[user] no author(s) selected");
    return;
  }
  var selectedGids = $('#epGroups :selected').map(function() { return this.value; }).get();
  if (selectedGids.length == 0) {
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
  $.each(aAuthors, function(idx, aid) {
    $.each(aGroups, function(idx, gid) {
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
  $('#epSessions option[value="' + id + '"]').attr('selected', true);
  // update info
  epc_sessionsInfo();
}

function epc_sessionsRemove(verbose, data) {
  console.log('[debug|epc_sessionsRemove]');

  var selected = $('#epSessions :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_sessionsRemove] confirmation message');
      $('#popupTitle').html('warning: confirmation required');
      var suffix = '';
      if (selected.length > 1)
        suffix = 's';
      sMessage = '<p>are you sure you want to permanently remove the following session' + suffix + ':</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      popupToggle('info', 'yes|no', [function() {epc_sessionsRemove(true, true);}]);
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        var selectedIndex = $("#epSessions option:selected")[0].index;
        $.each(selected, function(idx, id) {
          var args = [id];
          var jsonData = ep_call('deleteSession', args, verbose);
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

  var selected = $('#epSessions :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    var id = selected[0];
    var session = sessions[id];
    if (session === undefined) {
      if (id != 'All')
        console.log('[debug] broken session reference key');
      return;
    }

    var props = ['id', 'author', 'group', 'expiry'];

    // ensure info
    if (session['authorID'] === undefined) {
      var jsonData = ep_call('getSessionInfo', [id], verbose, true);
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

    // prop specific styling
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
    var html = '';
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

  // remember current selection
  var selected = $('#epGroups :selected').map(function(){return this.value;}).get();

  // reset groups object
  groups = {};

  var jsonData;
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
  // reselect selected
  $.each(selected, function(idx, id) {
    $('#epGroups option[value="' + id + '"]').attr('selected', true);
  });
  // update pads list
  if (pads !== undefined)
    epc_pads();
}

function epc_groupsShow() {
  console.log('[debug|epc_groupsShow]');

  $('#epGroups').html('');
  $.each(groups, function(key, group) {
    if (group['name'] === undefined)
      $('#epGroups').append('<option value="' + group['id'] + '">[' + group['id'] + ']</option>');
    else
      $('#epGroups').append('<option value="' + group['id'] + '">' + group['name'] + ' [' + group['id'] + ']</option>');
  });
  if ($('#epGroups')[0].length > 0) {
    $('#epGroups').prepend('<option value="All">All</option>');
    $('#epGroupsTitle').html('groups (' + ($('#epGroups')[0].length - 1) + ')');
  } else
    $('#epGroupsTitle').html('groups (0)');
}

function epc_groupsAdd(verbose) {
  console.log('[debug|epc_groupsAdd]');

  var name = $('#epGroupName').val();
  var args = [name];
  var jsonData = ep_call('createGroupIfNotExistsFor', args, verbose);
  if (jsonData !== undefined) {
    var id = jsonData['groupID'];
    if (groups === undefined)
      groups = {};
    var group = groups[id];
    if (group === undefined) {
      groups[id] = { 'id': id, 'name': name };
      console.log('[info] group name \'' + name + '\' added with id \'' + id + '\'');
    } else
      console.log('[info] group name \'' + name + '\' already exists with id \'' + id + '\'');

    // reload group
    epc_groupsShow();
    // select added / existing
    $('#epGroups option[value="' + id + '"]').attr('selected', true);
  }
}

function epc_groupsRemove(verbose, data) {
  console.log('[debug|epc_groupsRemove]');

  var selected = $('#epGroups :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_groupsRemove] confirmation message');
      $('#popupTitle').html('warning: confirmation required');
      var suffix = ''
      if (selected.length > 1)
        suffix = 's';
      var sMessage = '<p>are you sure you want to permanently remove the following group' + suffix + ':</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      popupToggle('info', 'yes|no', [function() {epc_groupsRemove(true, true);}]);
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        var selectedIndex = $("#epGroups option:selected")[0].index;
        $.each(selected, function(idx, id) {
          var args = [id];
          var jsonData = ep_call('deleteGroup', args, verbose);
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

  // remember current selection
  selected = $('#epAuthors :selected').map(function(){return this.value;}).get();

  // reset authors object
  authors = {};

  var jsonData;
  jsonData = epx_call('listAllAuthors', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null) {
    // process
    authors = jsonData;
    $.each(authors, function(key, author) {
      author['map'] = null;
      author['mapped'] = false;
    });
  }
  // map external names where possible
  jsonData = epx_call('getAuthorMappers', undefined, true, true);
  if (jsonData !== undefined && jsonData !== null) {
    // process
    $.each(jsonData, function(id, data) {
      var author = authors[id];
      author['mapped'] = true;
      author['map'] = data['name'];
    });
  }

  // update select control
  epc_authorsShow();
  // reselect selected
  $.each(selected, function(idx, id) {
    $('#epAuthors option[value="' + id + '"]').attr('selected', true);
  });
  // update pad info
  if ($('#epInfo-title:contains("(pad)")')[0] !== undefined)
    epc_padsInfo();
}

function epc_authorsShow() {
  console.log('[debug|epc_authorsShow]');

  $('#epAuthors').html('');
  $.each(authors, function(key, author) {
    if (author['map'] === undefined)
      $('#epAuthors').append('<option value="' + author['id'] + '">[' + author['id'] + ']</option>');
    else
      $('#epAuthors').append('<option value="' + author['id'] + '">' + author['map'] + ' [' + author['id'] + ']</option>');
  });
  if ($('#epAuthors')[0].length > 0) {
    $('#epAuthors').prepend('<option value="All">All</option>');
    $('#epAuthorsTitle').html('authors (' + ($('#epAuthors')[0].length - 1) + ')');
  } else
    $('#epAuthorsTitle').html('authors (0)');
}

function epc_authorsAdd(verbose) {
  console.log('[debug|epc_authorsAdd]');

  var map = $('#epAuthorName').val();
  var args = [map, map];
  var jsonData = ep_call('createAuthorIfNotExistsFor', args, verbose);
  if (jsonData !== undefined) {
    var id = jsonData['authorID'];
    if (authors === undefined)
      authors = {};
    var author = authors[id];
    if (author === undefined) {
      authors[id] = { 'id': id, 'map': map, 'name': map, 'mapped': true };
      console.log('[info] author name \'' + map + '\' added with id \'' + id + '\'');
    } else
      console.log('[info] author name \'' + map + '\' already exists with id \'' + id + '\'');

    // reload author
    epc_authorsShow();
    // select added / existing
    $('#epAuthors option[value="' + id + '"]').attr('selected', true);
  }
}

function epc_authorsRemove(verbose, data) {
  console.log('[debug|epc_authorsRemove]');

  selected = $('#epAuthors :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {
    if (data === undefined) {
      // confirmation message
      console.log('[debug|epc_authorsRemove] confirmation message');
      $('#popupTitle').html('warning: confirmation required');
      var suffix = ''
      if (selected.length > 1)
        suffix = 's';
      var sMessage = '<p>are you sure you want to permanently remove the following author' + suffix + ':</p>\n';
      sMessage += '<ul>\n';
      $.each(selected, function(key, value) {
        sMessage += '<li>' + value + '</li>\n'
      });
      sMessage += '</ul>\n';
      $('#popupContent').html(sMessage);
      popupToggle('info', 'yes|no', [function() {epc_authorsRemove(true, true);}]);
    } else {
      // toggle popup
      popupToggle();
      // do deletion
      if (data === true) {
        var selectedIndex = $("#epAuthors option:selected")[0].index;
        $.each(selected, function(key, value) {
          var args = [id];
          var jsonData = epx_call('deleteAuthor', args, verbose);
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

function epc_authorsInfo(verbose) {
  console.log('[debug|epc_authorsInfo]');

  // get selected id
  var selected = $('#epAuthors :selected').map(function(){return this.value;}).get();
  if (selected.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    var id = selected[0];
    var author = authors[id];
    if (author === undefined) {
      if (id != 'All')
        console.log('[debug] broken author reference key');
      return;
    }

    var props = ['id', 'map', 'name', 'mapped'];

    // build html
    var authorHTML = {};
    var propHTMLSuffix = "<span style='font-size: 1.1em;'>"
    var propHTMLPostfix = "</span>";

    // prop specific styling
    $.each(props, function(idx, prop) {
      switch (prop) {
      }
    });

    // construct html
    var html = '';
    $.each(props, function(idx, prop) {
      html += '<p style="margin: 3px 0px 2px; font-size: 0.8em;"><b>' + prop + ': </b>' + (authorHTML[prop] ? authorHTML[prop] : propHTMLSuffix + (author[prop] !== undefined ? author[prop] : '') + propHTMLPostfix) + '</p>';
    });
    $('#epInfo-inner').html(html);
    $('#epInfo-title').html('info (author)');
  }
}

function epc_authorMap(verbose, data) {
  console.log('[debug|epc_authorMap]');

  if (data === undefined) {
    $('#epStatus-inner').html('');
    var selected = $('#epAuthors :selected').map(function() { return this.value; }).get();
    if (selected.length == 0) {
      alert("[user] no author(s) selected");
      return;
    }
    var data = { 'pool': selected, 'set': false };
  }

  if (data['pool'].length > 0) {
    var id = data['pool'][0];
    var author = authors[id];
    console.log("[debug|epc_authorMap] processing author id: " + id);

    if (!data['set']) {
      console.log("[debug|epc_authorMap] not set");

      var sMessage = '<p><b>author</b><br>\nid: ' + id + '<br>\nmap: <b>' + author['map'] + '</b><br>\nname: ' + author['name'] + '<br>\n<br>\n';
      $('#popupTitle').html('input: map name');
      if (author['map']) {
        sMessage += 'please modify the desired \'map\' name below';
        $('#popup-input').val(author['map']);
      } else
        sMessage += 'please set the desired \'map\' name below</p>\n';
      sMessage += '</p>\n';
      $('#popupContent').html(sMessage);
      popupToggle('input', 'ok|cancel', [function() {
                                          data['set'] = true;
                                          epc_authorMap(true, data);}]);
    } else {
      console.log("[debug|epc_authorMap] set");

      // recover input
      var map = $('#popup-input').val();

      // toggle popup
      popupToggle();

      if (author['map'] !== map) {
        // set data
        var args = [id, map];
        var jsonData = epx_call('setAuthorMap', args, verbose, true);
        if (jsonData !== undefined && jsonData !== null) {
          console.log('[info|epc_authorMap] map set to \'' + map + '\' for author id \'' + id + '\'');
          author['map'] = map;
          data['pool'].shift();
          // reset popup
          $('#popup-input').val('');
        } else {
          console.log('[debug|epc_authorMap] cannot set author map \'' + map + '\' for author id \'' + id + '\'');
          alert('[error] cannot set author map \'' + map + '\' for author id \'' + id + '\'');          }
      }
      if (data['pool'].length > 0) {
        data['set'] = false;
        epc_authorMap(verbose, data);
      }
    }
  } else {
    // update author info
    if ($('#epInfo-title:contains("(author)")')[0] !== undefined)
      epc_authorsInfo();
  }
}

function epc_authorName(verbose, data) {
  console.log('[debug|epc_authorName]');

  if (data === undefined) {
    $('#epStatus-inner').html('');
    var selected = $('#epAuthors :selected').map(function() { return this.value; }).get();
    if (selected.length == 0) {
      alert("[user] no author(s) selected");
      return;
    }
    var data = { 'pool': selected, 'set': false };
  }

  if (data['pool'].length > 0) {
    var id = data['pool'][0];
    var author = authors[id];
    console.log("[debug|epc_authorName] processing author id: " + id);

    if (!data['set']) {
      console.log("[debug|epc_authorName] not set");

      var sMessage = '<p><b>author</b><br>\nid: ' + id + '<br>\nmap: ' + author['map'] + '<br>\nname: <b>' + author['name'] + '</b><br>\n<br>\n';
      $('#popupTitle').html('input: display name');
      if (author['name']) {
        sMessage += 'please modify the desired \'display\' name below';
        $('#popup-input').val(author['name']);
      } else
        sMessage += 'please set the desired \'display\' name below</p>\n';
      sMessage += '</p>\n';
      $('#popupContent').html(sMessage);
      popupToggle('input', 'ok|cancel', [function() {
                                        data['set'] = true;
                                        epc_authorName(true, data)}]);
    } else {
      console.log("[debug|epc_authorName] set");

      // recover input
      var name = $('#popup-input').val();

      // toggle popup
      popupToggle();

      if (author['name'] !== name) {
        // set data
        var args = [id, name];
        var jsonData = epx_call('setAuthorName', args, verbose, true);
        if (jsonData !== undefined && jsonData !== null) {
          console.log('[info|epc_authorName] name set to \'' + name + '\' for author id \'' + id + '\'');
          author['name'] = name;
          data['pool'].shift();
          // reset popup
          $('#popup-input').val('');
        } else {
          console.log('[debug|epc_authorName] cannot set author name \'' + name + '\' for author id \'' + id + '\'');
          alert('[error] cannot set author name \'' + name + '\' for author id \'' + id + '\'');          }
      }
      if (data['pool'].length > 0) {
        data['set'] = false;
        epc_authorName(verbose, data);
      }
    }
  } else {
    // update author info
    if ($('#epInfo-title:contains("(author)")')[0] !== undefined)
      epc_authorsInfo();
  }
}

function sessionExpiry(quantity, unit) {

  var expiry;

  if (quantity !== undefined && quantity !== "") {
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

function popupToggle(type, buttons, cbs) {
  if (type === undefined)
    var type = "info";
  if (buttons === undefined)
    var buttons = "ok";
  if (cbs === undefined)
    var cbs = [];

  switch (type) {
    case "info":
      $('#popupInput').css('display', 'none');
      break;
    case "input":
      $('#popupInput').css('display', 'block');
      break;
  }

  // setup buttons
  while (cbs.length < 2) {
    // pad with default callbacks
    cbs.push(function(){popupToggle();})
  }
  $('#popupButtons input[type="button"]').css('opacity', 0.0);
  $.each(buttons.split('|'), function(idx, button) {
    $('#popup-button-' + (idx + 1)).val(button);
    $('#popup-button-' + (idx + 1)).off('click');
    $('#popup-button-' + (idx + 1)).on('click', cbs[idx]);
    $('#popup-button-' + (idx + 1)).css('opacity', 1.0);
  });

  // toggle visibility
  if ($('#popup-background').css('display') === 'none') {
    $('#popup-background').css('display', 'block');
    $('#popup-outer').css('display', 'block');
  } else {
    $('#popup-background').css('display', 'none');
    $('#popup-outer').css('display', 'none');
  }

  // input selection (must be last)
  if (type === "input") {
    $('#popup-input').focus();
    $('#popup-input').select();
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

