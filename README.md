
## Etherpad-Lite Control

### description
a html/javascript/php interface for Etherpad-Lite administration. Uses Etherpad-Lite API where possible, supplemented by direct database calls to extend functionality where needed

### features
- add / remove groups
- remove multiple pads
- view pad content
- list all authors
- display group 'mapper' names __*__

__*__ requires non-api/direct database calls to a supported database [currently: 'postgre' only]

### dependencies
- php >5.3
- etherpad-lite-client [php bindings for Etherpad-Lite (https://github.com/0x46616c6b/etherpad-lite-client.git)]
- jquery
- composer
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

### known issues
extended/non-api methods which perform operations directly on the database do not use the same 'UeberDB' middleware database wrapper as the api calls do. consequently, UeberDB's 'cache/buffer' can cause problems

the file under the 'patch/' directory named 'expose-UeberDB-db-wrapper-settings-to-users.diff' can be used to work around this issue by exposing the 'cache' setting of UeberDB, so its default setting can then be overriden. this should negatively impact speed, however i haven't noticed any difference yet

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
#### done
- ui layout
- php client wrapper
- api token check
- maintain state
- list all pads
- popup dialog mechanism
- view pad content
- delete pads
- list all groups
- list all authors
- switch for global and group private/public pads
- list group pads
- add/remove groups
- add database layer
- reference mapper names

#### todo
- group/pad info
- set pad passwords
- create sessions to add/remove user(s) to/from group(s)
- convert global pads to group pads
- allow non-api functionality to be disabled

