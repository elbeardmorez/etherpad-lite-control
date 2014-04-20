
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

