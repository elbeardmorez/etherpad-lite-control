
## Etherpad-Lite Control

### description
a html/javascript (frontend) / php (backend) interface for Etherpad-Lite administration. uses Etherpad-Lite's API where possible, supplemented by direct database calls to extend functionality where needed

### features
- list authors, pad groups, pads and sessions __*__
- add and remove authors, pad groups, pads and sessions __*__
- display author, pad and session information __*__
- view pad content
- modify author map and display names __*__
- distinguish global (public), global (private) and regular pads types __*__
- create sessions for facilitating secure access of author add/remove user(s) to/from group(s)

__*__ note: most functionality is now dependent on non-api/direct database calls to a supported database [currently: 'postgre' only]

### dependencies
- php >5.3 [server-side scripting]
- jQuery [client script loaded at runtime]
- etherpad-lite-client [php bindings for Etherpad-Lite (https://github.com/0x46616c6b/etherpad-lite-client.git)]
- composer [installation tool] 
- postgre [additional non-api functionality]

## <p></p>

### installation / running

there is a php 'include' referencing a '*composer*' (dependency manager) installation of the 'etherpad-lite-client' php library dependency. the following are the minimal steps to install and run the application:

```
# pull project
> git clone https://github.com/elbeardmorez/etherpad-lite-control.git etherpad-lite-control

# install composer (if not already available)
> curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer

# switch to project root
> cd /path/to/etherpad-lite-control

# install dependencies
> composer --verbose install

# run*
> php /path/to/etherpad-lite-control/index.php
```

*personally, i deploy for use through an Apache web server
## <p></p>

### usage

**settings:**
<br>-all settings have defaults (as shown in the example below), but if nothing happens when you click 'controls->misc->status' then one or more of the following needs setting:
```
  server: http://localhost/
  port: 9998
  base path: [disabled*]
  api key path: /var/www/etherpad-lite/APIKEY.txt
  settings path: /var/www/etherpad-lite/settings.json
```
__*__ currently unavailable due to a limitation of one of Etherpad-Lite's components

**status:**
<br>-logging messages and raw return values

**info:**
<br>-information for the selected type

**title/logo:**
<br>-click/activate to force a reload of the page

**authors:**
<br>-current authors list, dependent on whether 'global' or 'group' authors set
<br>-input box for unique 'map' name
<br>-add button, requires unique name in input box
<br>-remove button, requires selected item(s)

**groups:**
<br>-groups (of pads) list,
<br>-input box for unique 'map' name
<br>-add button, requires unique name in input box
<br>-remove button, requires selected item(s)
<br>-selection limits pads list to associated pad(s)

**pads:**
<br>-drop-down for selecting type of pad listed
<br>-pads list
<br>-input box for unique name
<br>-add button, requires unique name in input box. group/regular pad creation dependent on group list selection
<br>-remove button, requires selected item(s)

**sessions:**
<br>-sessions list
<br>-input box for numeric quantity
<br>-drop-down for selecting unit of time
<br>-add button, requires valid quantity in input box and both group and pad list selections
<br>-remove button, requires selected item(s)

**controls:**
<br>-<i>global->authors</i>, load full list of authors
<br>-<i>global->groups</i>, load full list of groups
<br>-<i>global->pads</i>, load full list of pads
<br>-<i>global->sessions</i>, load full list of sessions
<br>-<i>author->map</i>, modify map name for selected author(s)
<br>-<i>author->name</i>, modify display name for selected author(s)
<br>-<i>group->authors</i>, load list of authors associated with the selected group(s') pads
<br>-<i>group->authors</i>, load list of pads associated with the selected group(s)
<br>-<i>pad->content</i>, display (read-only) content of selected pad
<br>-<i>misc->help</i>, display this usage information in a popup
<br>-<i>misc->status</i>, checks the Etherpad-Lite api token is accessible and valid
<br>-<i>misc->test</i>, pulls the top 10 records from the database
<br>-<i>misc->clean</i>, remove non-essential records from the database

## <p></p>

### known issues
extended/non-api methods which perform operations directly on the database do not use the same 'UeberDB' middleware database wrapper as the api calls do. consequently, UeberDB's 'cache/buffer' can cause problems

the file under the 'patch/' directory named 'expose-UeberDB-db-wrapper-settings-to-users.diff' can be used to work around this issue by exposing the 'cache' setting of UeberDB, so its default setting can then be overridden. this should negatively impact speed, however i haven't noticed any difference yet

```
cd /path/to/etherpad-lite
patch --verbose -p1  < expose-UeberDB-db-wrapper-settings-to-users.diff
```

having applied the patch, simply add the following to your 'settings.json' file, remembering to correctly comma-delimit this additional setting from any adjacent settings to ensure the JSON format remains valid

```
    "dbWrapperSettings" : { "cache"   : 0 }
```

#### adding an author fails to set the 'map' name when that author map name has previously been removed
here, the non-api 'deleteAuthor()' method has deleted the 'mapper2author' key which governs the map name for a given author. when creating the new author, the api's 'createAutherIfNotExistsFor()' method checks for existence of a 'mapper2author' key, finds one in the UeberDB cache/buffer, and thus assumes that it already exists in the underlying database. Consequently no new record is created. the non-api 'listAllAuthors()' method then looks and fails to find this 'mapper2author' record and sets the map name to 'null'. this can be worked around by disabling the UeberDB cache mechanism as shown above

## <p></p>

### development
#### todo
- move to asynchronous ajax calls
- set pad passwords
- convert global pads to group pads
- allow non-api functionality to be disabled
- port database queries to mysql

