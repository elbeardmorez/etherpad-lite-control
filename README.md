
## Etherpad-Lite Control

### description
a minimal html/javascript/php interface for the Etherpad-Lite API allowing for easy manipulation of groups, authors and pads

### dependencies
- php >5.3
- etherpad-lite-client [php bindings for Etherpad-Lite (https://github.com/0x46616c6b/etherpad-lite-client.git)]
- jquery
- composer

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

#### todo
- list all groups
- list all authors
- delete pads
- group/pad info
- set pad passwords
- toggle pad private/public
- add/remove user(s) to/from group(s)

