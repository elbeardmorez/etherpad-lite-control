
// globals
var help;

var authors;
var authorsShow;
var groups;
var groupsShow;
var pads;
var padsShow;
var sessions;
var sessionsShow;

var padProps = ['name', 'created', 'updated', 'type', 'author(s)'];
var authorProps = ['id', 'map', 'name', 'mapped', 'pad(s)'];
var sessionProps = ['id', 'author', 'group', 'expiry'];

var authorsSelected = { 'count': 0 };
var groupsSelected = { 'count': 0 };
var padsSelected = { 'count': 0 };

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

//
// authors
//

function epc_authors(data, verbose) {
  console.log('[debug|epc_authors]');

  if (data === undefined)
    var data = 'global';

  // remember current selection
  selected = $('#epAuthors :selected').map(function(){return this.value;}).get();

  var aData = [];
  var jsonData;
  switch (data) {
    case 'global':
      jsonData = epx_call('listAllAuthors', [], verbose);
      if (jsonData !== undefined && jsonData !== null)
        aData.push(jsonData);
      break;
    case 'group':
      selectedGids = $('#epGroups :selected').map(function(){return this.value;}).get();
      // collect padIDs, from which to collect authorIDs
      if (selectedGids.length > 0) {
        $.each(selectedGids, function(idx, gid) {
          jsonData = {};
          groups[gid]['padIDs'] &&
            $.each(groups[gid]['padIDs'], function (idx2, pid) {
              pads[pid]['authorIDs'] &&
                $.each(pads[pid]['authorIDs'], function (idx3, aid) {
                  jsonData[aid] = authors[aid];
        });});});
      } else {
        jsonData = epx_call('listAllAuthors', [], verbose);
        if (jsonData !== undefined && jsonData !== null)
          aData.push(jsonData);
      }
      break;
  }

  // reset authorsShow array
  authorsShow = [];
  // reset authors object
  if (!authors)
    authors = {};

  if (aData.length > 0) {
    // process
    $.each(aData, function(idx, jsonData) {
      if (jsonData) {
        $.each(jsonData, function(id, author) {
          if (!authors[id]) {
            authors[id] = author;
            authors[id]['map'] = null;
            authors[id]['mapped'] = false;
          } else if (authors[id] !== author) {
            // update
            authors[id]['name'] = author['name'];
            if (author['padIDs'])
              authors[id]['padsID'] = author['padsID'];
          }
          // process
          if (authors[id]['padIDs']) {
            // simple array
            if (!$.isArray(authors[id]['padIDs']))
              authors[id]['padIDs'] = Object.keys(authors[id]['padIDs']);
            // flatten
            authors[id]['pad(s)'] = authors[id]['padIDs'].join(', ');
          } else
            authors[id]['pad(s)'] = '';
          authorsShow.push(id);
        });
      }
    });

    // map external names where possible
    jsonData = epx_call('getAuthorMappers', undefined, true, true);
    if (jsonData !== undefined && jsonData !== null) {
      // process
      $.each(jsonData, function(id, data) {
        authors[id]['mapped'] = true;
        authors[id]['map'] = data['name'];
      });
    }
  }

  // update select control
  epc_authorsShow();
  // reselect selected
  $.each(selected, function(idx, id) {
    $('#epAuthors option[value="' + id + '"]').attr('selected', true);
  });
  // update info
  var info = $('#epInfo-title')[0].innerHTML.match(/.*\((author|pad|session)\).*|/)[1];
  switch (info) {
    case 'author':
      epc_authorsInfoShow();
      break;
    case 'pad':
      epc_padsInfoShow();
      break;
    case 'session':
      epc_sessionsInfoShow();
      break;
  }
}

function epc_authorsShow() {
  console.log('[debug|epc_authorsShow]');

  $('#epAuthors').html('');
  if (authorsShow) {
    var authorsShowDisplay = [];
  $.each(authorsShow, function(idx, id) {
    author = authors[id];
    if (author['map'] === undefined)
        authorsShowDisplay.push(author['id'] + '|<option value="' + author['id'] + '">[' + author['id'] + ']</option>');
    else
        authorsShowDisplay.push(author['map'] + '|<option value="' + author['id'] + '">' + author['map'] + ' [' + author['id'] + ']</option>');
  });
    authorsShowDisplay.sort();
    $.each(authorsShowDisplay, function(idx, display) {
      $('#epAuthors').append(display.split('|')[1]);
    });
    if (authorsShowDisplay.length > 0)
    $('#epAuthors').prepend('<option value="All">All</option>');
    $('#epAuthorsTitle').html('authors (' + authorsShowDisplay.length + ')');
  }
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
    authorsShow.push(id);

    // reload author
    epc_authorsShow();
    // select added / existing
    $('#epAuthors option[value="' + id + '"]').attr('selected', true);
    // update info
    epc_authorsInfoShow();
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
        $.each(selected, function(idx, id) {
          var args = [id];
          var jsonData = epx_call('deleteAuthor', args, verbose);
          if (jsonData !== undefined && jsonData['affected'] == 1) {
            console.log('[info] deleted author, id: \'' + id + '\'');
            delete(authors[id]);
            authorsShow.splice(authorsShow.indexOf(id), 1);
          } else
            console.log('[debug] issue deleting author, id: \'' + id + '\'');
        });
        // reload author
        epc_authorsShow();
        // reselect
        if (selectedIndex > $('#epAuthors')[0].length - 1)
          selectedIndex = $('#epAuthors')[0].length - 1;
        $('#epAuthors')[0].selectedIndex = selectedIndex;
        // update info
        var info = $('#epInfo-title')[0].innerHTML.match(/.*\((author)\).*|/)[1];
        switch (info) {
          case 'author':
            epc_authorsInfoShow();
        }
      }
    }
  }
}

function epc_authorsInfo(verbose, data) {
  console.log('[debug|epc_authorsInfo]');

  $.each(data, function(idx, id) {
    var author = authors[id];

    var calls = {};
    if (author === undefined)
      console.log('[debug] broken author reference key: ' + id);
    else {
      // collect info strings
      var append = false;
      $.each(authorProps, function(idx, prop) {
      });
    }
  });
}

function epc_authorsInfoShow(verbose, data) {
  console.log('[debug|epc_authorsInfoShow]');

  if (!data)
    // use selected id
    data = $('#epAuthors :selected').map(function(){return this.value;}).get();

  if (data && data.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    var id = data[0];
    var author = authors[id];

    // check for 'all'
    if (author === undefined) {
      if (id != 'All')
        console.log('[debug] broken author reference key');
      return;
    }

    // ensure info
    epc_authorsInfo(verbose, [id]);

    // html
    var authorHTML = {};
    var propHTMLSuffix = "<span style='font-size: 1.1em;'>"
    var propHTMLPostfix = "</span>";

    // prop specific styling
    $.each(authorProps, function(idx, prop) {
      switch (prop) {
      }
    });

    // construct html
    var html = '';
    $.each(authorProps, function(idx, prop) {
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
    $('#popup-input').val('');
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
        if (!$('#popup-input').val())
          $('#popup-input').val(author['map']);
      } else
        sMessage += 'please set the desired \'map\' name below</p>\n';
      sMessage += '</p>\n';
      $('#popupContent').html(sMessage);
      popupToggle('input', 'ok|skip|cancel',
        [function() {data['set'] = true; epc_authorMap(verbose, data);},
         function() {$('#popup-input').val(''); popupToggle(); data['pool'].shift(); epc_authorMap(verbose, data);}]);
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
        var sMessage;
        if (jsonData !== undefined && jsonData !== null) {
          if (map === '') {
            map = null;
            author['mapped'] = false;
            sMessage = '[info|epc_authorMap] author map removed for author id \'' + id + '\'';
          } else {
            author['mapped'] = true;
            sMessage = '[info|epc_authorMap] author map \'' + map + '\' set for author id \'' + id + '\'';
          }
          author['map'] = map;
          // update selection
          $('#epAuthors option[value="' + id + '"]')[0].innerHTML = map + ' [' + id + ']';
          // next
          data['pool'].shift();
          $('#popup-input').val('');
        } else {
          if (map === '') {
            sMessage = '[error|epc_authorMap] author map not removed for author id \'' + id + '\'';
          } else {
            sMessage = '[error|epc_authorMap] author map \'' + map + '\' not set for author id \'' + id + '\'';
          }
          alert(sMessage);
        }
        console.log(sMessage);
      } else {
        // skip
        data['pool'].shift();
        $('#popup-input').val('');
      }

      if (data['pool'].length > 0) {
        data['set'] = false;
        epc_authorMap(verbose, data);
      } else {
        // update info
        var info = $('#epInfo-title')[0].innerHTML.match(/.*\((author|session)\).*|/)[1];
        switch (info) {
          case 'author':
            epc_authorsInfoShow();
            break;
          case 'session':
            epc_sessionsInfoShow();
            break;
        }
      }
    }
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
    $('#popup-input').val('');
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
        if (!$('#popup-input').val())
          $('#popup-input').val(author['name']);
      } else
        sMessage += 'please set the desired \'display\' name below</p>\n';
      sMessage += '</p>\n';
      $('#popupContent').html(sMessage);
      popupToggle('input', 'ok|skip|cancel',
        [function() {data['set'] = true; epc_authorName(verbose, data);},
         function() {$('#popup-input').val(''); popupToggle(); data['pool'].shift(); epc_authorName(verbose, data);}]);
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
        var sMessage;
        if (jsonData !== undefined && jsonData !== null) {
          author['name'] = name;
          sMessage = '[info|epc_authorName] author name \'' + name + '\' set for author id \'' + id + '\'';
          // next
          data['pool'].shift();
          $('#popup-input').val('');
        } else {
          sMessage = '[error|epc_authorName] author name \'' + name + '\' not set for author id \'' + id + '\'';
          alert(sMessage);
        }
      } else {
        // skip
        data['pool'].shift();
        $('#popup-input').val('');
      }

      if (data['pool'].length > 0) {
        data['set'] = false;
        epc_authorName(verbose, data);
      } else {
        // update info
        var info = $('#epInfo-title')[0].innerHTML.match(/.*\((author|session)\).*|/)[1];
        switch (info) {
          case 'author':
            epc_authorsInfoShow();
            break;
          case 'session':
            epc_sessionsInfoShow();
            break;
        }
      }
    }
  }
}

function epc_authorPads(verbose) {
  console.log('[debug|epc_authorPads]');
  epc_pads('author');
}

//
// groups
//

function epc_groups(verbose) {
  console.log('[debug|epc_groups]');

  // remember current selection
  var selected = $('#epGroups :selected').map(function(){return this.value;}).get();

  // reset groupsShow array
  groupsShow = [];
  // reset groups object
  if (!groups)
    groups = {};

  var jsonData;
  jsonData = ep_call('listAllGroups', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null) {
    // process
    if (jsonData['groupIDs'].length > 0) {
      $.each(jsonData['groupIDs'], function(idx, id) {
        if (groups[id] === undefined)
          groups[id] = {'id': id};
        // process
        groupsShow.push(id);
      });
    }
  }

  // map external names where possible
  jsonData = epx_call('getGroupMappers', undefined, true, true);
  if (jsonData !== undefined && jsonData !== null) {
    // process
    $.each(jsonData, function(id, data) {
      if (groups[id])
        groups[id]['name'] = data['name'];
      else
        console.log('[debug] lost group id \'' + id + '\'');
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
  // update info
  var info = $('#epInfo-title')[0].innerHTML.match(/.*\((session)\).*|/)[1];
  switch (info) {
    case 'session':
      epc_sessionsInfoShow();
      break;
  }
}

function epc_groupsShow() {
  console.log('[debug|epc_groupsShow]');

  $('#epGroups').html('');
  if (groupsShow) {
    var groupsShowDisplay = [];
  $.each(groupsShow, function(idx, id) {
    group = groups[id]
    if (group['name'] === undefined)
        groupsShowDisplay.push(group['id'] + '|<option value="' + group['id'] + '">[' + group['id'] + ']</option>');
    else
        groupsShowDisplay.push(group['name'] + '|<option value="' + group['id'] + '">' + group['name'] + ' [' + group['id'] + ']</option>');
  });
    groupsShowDisplay.sort();
    $.each(groupsShowDisplay, function(idx, display) {
      $('#epGroups').append(display.split('|')[1]);
    });
    if (groupsShowDisplay.length > 0)
    $('#epGroups').prepend('<option value="All">All</option>');
    $('#epGroupsTitle').html('groups (' + groupsShowDisplay.length + ')');
  }
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
    groupsShow.push(id);

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
      sMessage += '<p>please note that this will <span style=\'color: red; font-weight: bold;\'>DELETE ALL ASSOCIATED PADS</span> in the process</p>\n';
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
          if (jsonData === null) {
            console.log('[info] deleted group, id: \'' + id + '\'');
            delete(groups[id]);
            groupsShow.splice(groupsShow.indexOf(id), 1);
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

  var aData = [];
  var jsonData;
  switch (data) {
    case 'global':
      jsonData = ep_call('listAllPads', [], verbose);
      if (jsonData !== undefined && jsonData !== null)
        aData.push(jsonData);
      break;
    case 'author':
      selectedAids = $('#epAuthors :selected').map(function(){return this.value;}).get();
      if (selectedAids.length > 0) {
        $.each(selectedAids, function(idx, aid) {
          authors[aid]['padIDs'] && aData.push({ 'padIDs': authors[aid]['padIDs'] });
        });
      } else {
        jsonData = ep_call('listAllPads', [], verbose);
        if (jsonData !== undefined && jsonData !== null)
          aData.push(jsonData);
      }
      break;
    case 'group':
      selectedGids = $('#epGroups :selected').map(function(){return this.value;}).get();
      if (selectedGids.length > 0) {
        $.each(selectedGids, function(idx, gid) {
          jsonData = ep_call('listPads', [gid], verbose);
          if (jsonData !== undefined && jsonData !== null) {
            groups[gid]['padIDs'] = jsonData['padIDs'];
            aData.push(jsonData);
          }
        });
      } else {
        jsonData = ep_call('listAllPads', [], verbose);
        if (jsonData !== undefined && jsonData !== null)
          aData.push(jsonData);
      }
      break;
  }

  // reset authorsShow array
  padsShow = [];
  // reset authors object
  if (!pads)
    pads = {};
  // reset pad types
  var padTypes = {};

  if (aData.length > 0) {
    // process
    $.each(aData, function(idx, jsonData) {
      if (jsonData['padIDs'].length > 0) {
        $.each(jsonData['padIDs'], function(idx2, id) {
          if (!pads[id])
            pads[id] = {'id': id, 'name': id};
          // process
          if (pads[id]['type'])
            padTypes[pads[id]['type']] = 1;
          else {
            var jsonData2 = ep_call('getPublicStatus', [id], false);
            if (jsonData2 === undefined) {
              // regular pad
              pads[id]['type'] = 'regular';
              padTypes['regular'] = 1;
            } else {
              // group pad
              // set public status
              if (jsonData2) {
                pads[id]['public'] = true;
                pads[id]['type'] = 'public group';
                padTypes['public group'] = 1;
              } else {
                pads[id]['public'] = false;
                pads[id]['type'] = 'private group';
                padTypes['private group'] = 1;
              }
            }
          }
          if (pads[id]['type'] !== 'regular' &&
              pads[id]['name'] == pads[id]['id']) {
            // modify name
            var arr = pads[id]['id'].match('(.*)\\$(.*)');
            var name = arr[2];
            var gid = arr[1];
            pads[id]['name'] = name + ' [' + (groups !== undefined ? groups[gid]['name'] : gid) + ']';
          }
          padsShow.push(id);
        });
      }
    });

    // update select controls
    $('#epPadsType').html('');
    padTypes['private group'] && $('#epPadsType').append('<option>group (private)</option>');
    padTypes['public group'] && $('#epPadsType').append('<option>group (public)</option>');
    padTypes['regular'] && $('#epPadsType').append('<option>regular</option>');
    epc_padsShow();
    // reselect selected
    $.each(selected, function(idx, id) {
      $('#epPads option[value="' + id + '"]').attr('selected', true);
    });
    // update info
    var info = $('#epInfo-title')[0].innerHTML.match(/.*\((pad)\).*|/)[1];
    switch (info) {
      case 'pad':
        epc_padsInfoShow();
        break;
    }
  } else
    $('#epPads').html('');
}

function epc_padsShow(type) {
  console.log('[debug|epc_padsShow]');

  if (type === undefined)
    type = $('#epPadsType').val();
  // map type display name to type
  switch (type) {
    case "group (private)":
      type = 'private group';
      break;
    case "group (public)":
      type = 'public group';
      break;
  }
  console.log("[debug|epc_padsShow] selected " + type + " pads");

  $('#epPads').html('');
  if (padsShow) {
    var padsShowDisplay = [];
    $.each(padsShow, function(idx, id) {
      pad = pads[id];
      if (pad['type'] === type)
        padsShowDisplay.push(pad['name'] + '|<option value="' + pad['id'] + '">' + pad['name'] + '</option>');
    });
    padsShowDisplay.sort();
    $.each(padsShowDisplay, function(idx, display) {
      $('#epPads').append(display.split('|')[1]);
    });
    if (padsShowDisplay.length > 0)
      $('#epPads').prepend('<option value="All">All</option>');
    $('#epPadsTitle').html('pads (' + padsShowDisplay.length + ')');
  }
}

function epc_padsAdd(verbose, data) {
  console.log('[debug|epc_padsAdd]');

  var func = '';
  var args = [];
  var id = $('#epPadName').val();
  var name = $('#epPadName').val();

  selectedGids = $('#epGroups :selected').map(function() { return this.value; }).get();
  if (selectedGids.length > 0) {
    // create a group pad
    func = 'createGroupPad';
    args = [selectedGids[0], name];
    id = selectedGids[0] + '$' + name;
    name = name + ' [' + (groups !== undefined ? groups[selectedGids[0]]['name'] : selectedGids[0]) + ']';
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
        var jsonData2 = ep_call('getPublicStatus', [id], verbose, true);
        if (jsonData2 === undefined)
          // regular pad
          pads[id]['type'] = 'regular';
        else {
          // group pad
          // set public status
          if (jsonData2) {
            pads[id]['public'] = true;
            pads[id]['type'] = 'public group';
          } else {
            pads[id]['public'] = false;
            pads[id]['type'] = 'private group';
          }
        }
        console.log('[info] pad name \'' + name + '\' added');
      } else
        console.log('[info] pad name \'' + name + '\' already exists');
      padsShow.push(name);
    }
  }

  // reload group
  epc_padsShow();
  // select added / existing
  $('#epPads option[value="' + id + '"]').attr('selected', true);
  // update info
  epc_padsInfoShow();
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
        $.each(selected, function(idx, id) {
          var args = [id];
          var jsonData = ep_call('deletePad', args, verbose);
          if (jsonData !== undefined && jsonData['affected'] == 1) {
            console.log('[info] deleted pad, id: \'' + id + '\'');
            delete(pads[id]);
            padsShow.splice(padsShow.indexOf(id), 1);
          } else
            console.log('[debug] issue deleting pad, id: \'' + id + '\'');
        });

        // reload pads
        epc_padsShow();
        // reselect
        if (selectedIndex > $('#epPads')[0].length)
          selectedIndex = $('#epPads')[0].length;
        $('#epPads')[0].selectedIndex = selectedIndex;
        // update info
        var info = $('#epInfo-title')[0].innerHTML.match(/.*\((pad|session)\).*|/)[1];
        switch (info) {
          case 'pad':
            epc_padsInfoShow();
            break;
          case 'session':
            epc_sessionsInfoShow();
            break;
        }
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

function epc_padsInfo(verbose, data) {
  console.log('[debug|epc_padsInfo]');

  $.each(data, function(idx, id) {
    var pad = pads[id];

    var calls = {};
    calls['created'] = [ 'nonapi', 'getPadCreated', [ id ], 'created' ];
    calls['updated'] = [ 'api', 'getLastEdited', [ id ], 'lastEdited' ];
    calls['author(s)'] = [ 'api', 'listAuthorsOfPad', [ id ], 'authorIDs' ];

    if (pad === undefined)
      console.log('[debug] broken pad reference key: ' + id);
    else {
      // collect info strings
      var append = false;
      $.each(padProps, function(idx, prop) {

        var bUpdate = true;
        var bProcess = true;

        // pre-processing
        switch (prop) {
          case 'created':
            if (pad['created'] !== undefined)
              bUpdate = bProcess = false;
          case 'updated':
            if (pad['updated'] !== undefined)
              bUpdate = bProcess = false;
            break;
          case 'author(s)':
            if (pad['authors'] !== undefined)
              bUpdate = false;
            break;
        }

        if (bUpdate && calls[prop] !== undefined) {
          var call = calls[prop];
          var type = call[0];
          var func = call[1];
          var args = call[2];
          var dataKey = call[3];

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
                  pad[prop] = pad[prop].split(',').map(function(s){ var author = authors[s.match(/^.*?\[(.*?)\]\s*$/)[1]]; return (author !== undefined ? (author['map'] ? author['map'] : author['name']) + ' [' + author['id'] + ']' : s.trim()); }).join(', ');
              }
              break;
          }
        }
      });
    }
  });
}

function epc_padsInfoShow(verbose, data) {
  console.log('[debug|epc_padsInfoShow]');

  if (!data)
    // use selected id
    data = $('#epPads :selected').map(function(){return this.value;}).get();

  if (data && data.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    var id = data[0];
    var pad = pads[id];

    // check for 'all'
    if (pad === undefined) {
      if (id != 'All')
        console.log('[debug] broken pad reference key');
      return;
    }

    // ensure info
    epc_padsInfo(verbose, [id]);

    // html
    var padHTML = {};
    var propHTMLSuffix = "<span style='font-size: 1.1em;'>"
    var propHTMLPostfix = "</span>";

    // prop specific styling
    $.each(padProps, function(idx, prop) {
      switch (prop) {
      }
    });

    // construct html
    var html = '';
    $.each(padProps, function(idx, prop) {
      html += '<p style="margin: 3px 0px 2px; font-size: 0.8em;"><b>' + prop + ': </b>' + (padHTML[prop] ? padHTML[prop] : propHTMLSuffix + (pad[prop] !== undefined ? pad[prop] : '') + propHTMLPostfix) + '</p>';
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

  // reset sessionsShow array
  sessionsShow = [];
  // reset sessions object
  if (!sessions)
    sessions = {};

  var jsonData;
  jsonData = epx_call('listAllSessions', undefined, verbose)
  if (jsonData !== undefined && jsonData !== null) {
    // process
    if (jsonData) {
      $.each(jsonData, function(id, session) {
        if (sessions[id] === undefined)
          sessions[id] = session;
        // process
        sessionsShow.push(id);
      });
    }
  }

  // update select control
  epc_sessionsShow();
  // reselect selected
  $.each(selected, function(idx, id) {
    $('#epSessions option[value="' + id + '"]').attr('selected', true);
  });
  // update info
  var info = $('#epInfo-title')[0].innerHTML.match(/.*\((session)\).*|/)[1];
  switch (info) {
    case 'session':
      epc_sessionsInfoShow();
      break;
  }
}

function epc_sessionsShow() {
  console.log('[debug|epc_sessionsShow]');

  $('#epSessions').html('');
  if (sessionsShow) {
    sessionsShow.sort();
  $.each(sessionsShow, function(idx, id) {
    session = sessions[id];
    $('#epSessions').append('<option value="' + session['id'] + '">' + session['id'] + '</option>');
  });
    if (sessionsShow.length > 0)
    $('#epSessions').prepend('<option value="All">All</option>');
    $('#epSessionsTitle').html('sessions (' + sessionsShow.length + ')');
  }
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
        sessionsShow.push(id);
      }
    });
  });

  // reload session
  epc_sessionsShow();
  // select added / existing
  $('#epSessions option[value="' + id + '"]').attr('selected', true);
  // update info
  epc_sessionsInfoShow();
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
            sessionsShow.splice(sessionsShow.indexOf(id), 1);
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
        var info = $('#epInfo-title')[0].innerHTML.match(/.*\((session)\).*|/)[1];
        switch (info) {
          case 'session':
            epc_sessionsInfoShow();
            break;
        }
      }
    }
  }
}

function epc_sessionsInfo(verbose, data) {
  console.log('[debug|epc_sessionsInfo]');

  $.each(data, function(idx, id) {
    var session = sessions[id];

    var calls = {};
    calls['author'] = [ 'api', 'getSessionInfo', [ id ], 'authorID' ];
    calls['group'] = [ 'api', 'getSessionInfo', [ id ], 'groupID' ];
    calls['expiryUTC'] = [ 'api', 'getSessionInfo', [ id ], 'validUntil' ];

    if (session === undefined)
      console.log('[debug] broken session reference key: ' + id);
    else {
      // collect info strings
      var append = false;
      $.each(sessionProps, function(idx, prop) {

        var bUpdate = true;
        var bProcess = true;

        // pre-processing
        switch (prop) {
          case 'author':
          case 'group':
            bUpdate = false;
            break;
          case 'expiry':
            bUpdate = false;
            if (session['expiry'] !== undefined)
              bProcess = false;
            break;
        }

        if (bUpdate && calls[prop] !== undefined) {
          var call = calls[prop];
          var type = call[0];
          var func = call[1];
          var args = call[2];
          var dataKey = call[3];

          var jsonData;
          if (type === "api")
            jsonData = ep_call(func, args, verbose, append);
          else
            jsonData = epx_call(func, args, verbose, append);
          // append any further status messages
          append = true;
          if (jsonData !== undefined)
            // add info to session object
            session[prop] = jsonData[dataKey];
        }

        if (bProcess) {
          // post processing
          switch (prop) {
            case 'author':
              if (!session['author'].match(/\ /)) {
                if (authors !== undefined) {
                  // resolve id
                  author = authors[session['author']];
                  if (author !== undefined)
                    session['author'] = (author['map'] ? author['map'] : author['name']) + ' [' + author['id'] + ']';
                }
              }
              break;
            case 'group':
              if (!session['group'].match(/\ /)) {
                if (groups !== undefined) {
                  // resolve id
                  group = groups[session['group']];
                  if (group !== undefined)
                    session['group'] = group['name'] + ' [' + group['id'] + ']';
                }
              }
              break;
            case 'expiry':
              if (session['expiry'] === undefined)
                // convert date
                session['expiry'] = getDateString(new Date(session['expiryUTC']));
              break;
          }
        }
      });
    }
  });
}

function epc_sessionsInfoShow(verbose, data) {
  console.log('[debug|epc_sessionsInfoShow]');

  if (!data)
    // use selected id
    data = $('#epSessions :selected').map(function(){return this.value;}).get();

  if (data && data.length > 0) {

    // clear last info
    $('#epInfo-inner').html('');
    $('#epInfo-title').html('info');

    var id = data[0];
    var session = sessions[id];

    // check for 'all'
    if (session === undefined) {
      if (id != 'All')
        console.log('[debug] broken session reference key');
      return;
    }

    // ensure info
    epc_sessionsInfo(verbose, [id]);

    // html
    var sessionHTML = {};
    var propHTMLSuffix = "<span style='font-size: 1.1em;'>"
    var propHTMLPostfix = "</span>";

    // prop specific styling
    $.each(sessionProps, function(idx, prop) {
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
    $.each(sessionProps, function(idx, prop) {
      html += '<p style="margin: 3px 0px 2px; font-size: 0.8em;"><b>' + prop + ': </b>' + (sessionHTML[prop] ? sessionHTML[prop] : propHTMLSuffix + (session[prop] ? session[prop] : '') + propHTMLPostfix) + '</p>';
    });
    $('#epInfo-inner').html(html);
    $('#epInfo-title').html('info (session)');
  }
}

//
// misc
//

function epc_help() {

  help = undefined;
  if (!help) {
    var jsonData = epx_call('help', [], false);
    if (jsonData !== undefined)
      help = jsonData['html'];
    else
      help = '[debug] error loading help';
  }
  $('#popupTitle').html('help');
  $('#popupContent').html(help);
  popupToggle();
}

function epc_status(verbose) {
  console.log('[debug|epc_status]');
  ep_call('checkToken', undefined, verbose);
}

function epc_test() {
  console.log('[debug|epc_test]');
  epx_call();
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
// extra
//

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

function getServer() {
  return $('#epc_server').val() + ":" +
         $('#epc_port').val() +
         ($('#epc_basepath').val() ? "/" +
          $('#epc_basepath').val() : "");
}

function init() {
  loadState();
}

function loadState() {
  var arr = [ 'epc_server', 'epc_port', 'epc_apikeypath', 'epc_settingspath' ];
  for (idx in arr) {
    var sElement = arr[idx];
    console.log('restoring state for: \'' + sElement + '\'');
    $('#' + sElement).val(getCookie(sElement));
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

function selection(pre, post, target, info) {
  console.log('[debug|selection]');

  console.log('[debug|selection] pre');
  $.each(pre, function(key, value) { console.log(key + '|' + value); })
  console.log('[debug|selection] post');
  $.each(post, function(idx, option) { console.log(option.value); })

  var id;
  if (post.length == 0) {
    Object.keys(pre).map(function(key) { delete pre[key]; });
    target.val('');
  } else if (post.length == 1) {
    // reset
    Object.keys(pre).map(function(key) { delete pre[key]; });
    option = post[0];
    pre[option.value] = option.value;
    target.val(option.textContent || option.innerText);
    id = option.value;
  } else if (pre['count'] < post.length) {
    // addition
    $.each(post, function(idx, option) {
      if (pre[option.value] === undefined) {
        pre[option.value] = option.value;
        target.val(option.textContent || option.innerText);
        id = option.value;
      }
    });
  } else {
    // removal
    Object.keys(pre).map(function(key) { delete pre[key]; });
    $.each(post, function(idx, option) { pre[option.value] = option.value; });
    id = post[0].value;
  }
  pre['count'] = post.length;
  id && info && info(id);
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
  var lButtons = $('#popupButtons input[type="button"]').length;
  while (cbs.length < lButtons) {
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

