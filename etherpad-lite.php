<?php

include ('vendor/autoload.php');
include ('tools.php');
include ('database.php');

function getSettings($settingsPath) {
  $dbSettings = null;
  error_log('[info] settingsPath: \'' . $settingsPath . '\'');
  $sSettings = getFileContents($settingsPath);
#  error_log('[info] sSettings: \'' . $sSettings . '\'');
  # remove comments
  $sSettings = preg_replace('/\/\*.*?\*\//s','', $sSettings);
  $sSettings = preg_replace('/\s*(#|\/\/).*?\n/s', "\n", $sSettings);
  $sSettings = preg_replace('/(^|\n)\s*\n/s',"\n", $sSettings);
#  error_log('[info] sSettings: \'' . $sSettings . '\'');

  if($sSettings) {
    $json = json_decode($sSettings, true);
    if ($json && isset($json['dbSettings']))
      $dbSettings = [ 'type' => $json['dbType'], 'settings' => $json['dbSettings'] ];
  } else
    error_log('[error] cannot read etherpad-lite settings from path \'' . $settingsPath . '\'');

  error_log('[info] dbSettings: \'' . var2str($dbSettings) . '\'');
  return $dbSettings;
}

function getApiKey($apiKeyPath) {
  $sApiKey = getFileContents($apiKeyPath);
  if(!$sApiKey) {
    $sApiKey = '';
    error_log('[error] cannot read etherpad-lite api key from path \'' . $apiKeyPath . '\'');
  }

#  error_log('[info] sApiKey: \'' . $sApiKey . '\'');
  return $sApiKey;
}

function epxCall($func, $args = [],
                $settingsPath = '/var/www/etherpad-lite/settings.json') {
  error_log('[debug|epxCall]');

  $sData = '';
  $jsonData = [ 'code' => 1,
                'message' => '[error] epxCall failed',
                'data' => null ];

  $dbSettings = getSettings($settingsPath);
  if ($dbSettings != null) {
    switch ($dbSettings['type']) {
      case "postgres":
        # connection
        # example: "host=localhost dbname=etherpad-lite user=www password=secret"
        $dbConnectionString = 'host=' . $dbSettings['settings']['host'] . ' ' .
                              'dbname=' . $dbSettings['settings']['database'] . ' ' .
                              'user=' . $dbSettings['settings']['user'] . ' ' .
                              'password=' . $dbSettings['settings']['password'];
        switch ($func) {
          case "getPadCreated":
            $pid = $args[0];
            $query = 'select value from store where key = \'pad:' . $pid . ':revs:0\'';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            // create json data
            $data2 = json_decode($data['data'][0]['value'], true);
            $data2 = [ 'created' => $data2['meta']['timestamp'] ];
            $data['data'] = $data2;
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "getGroupMappers":
            $query = 'select trim(value, \'\"\') as id, replace(key, \'mapper2group:\', \'\') as name from store where key like \'mapper2group:%\'';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            // create json data
            $data2 = [];
            if (isSet($data['data']['affected']))
              $data2 = null;
            else {
              foreach ($data['data'] as $arr)
                $data2[$arr['id']] = $arr;
            }
            $data['data'] = $data2;
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "getAuthorMappers":
            $query = 'select trim(value, \'\"\') as id, replace(key, \'mapper2author:\', \'\') as name from store where key like \'mapper2author:%\'';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            // create json data
            $data2 = [];
            if (isSet($data['data']['affected']))
              $data2 = null;
            else {
              foreach ($data['data'] as $arr)
                $data2[$arr['id']] = $arr;
            }
            $data['data'] = $data2;
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "setAuthorMap":
            $aid = $args[0];
            $map = $args[1];
            if ($map == '') {
              // remove existing map
              $query = 'delete from store where key like \'mapper2author:%\' and value = \'"' . $aid . '"\'';
              $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
              if ($data['data']['affected'] == 1) {
                $data['message'] = 'author map deleted for id \'' . $aid . '\'';
              } else {
                $data['code'] = 1;
                $data['message'] = 'author map not deleted for id \'' . $aid . '\'';
              }
            } else {
              // unique map in use?
              $query = 'select trim(value, \'\"\') as id, replace(key, \'mapper2author:\', \'\') as name from store where key = \'mapper2author:' . $map . '\'';
              $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
              if (isSet($data['data']['affected'])) {
                // no matching map found
                $query = 'insert into store values(\'mapper2author:' . $map . '\', \'"' . $aid . '"\')';
                $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
                if (isSet($data['data']['affected'])) {
                  if ($data['data']['affected'] != 1)  {
                    $data['code'] = 1;
                  }
                } else {
                  $data['code'] = 1;
                }
              } else {
                $data = ['data' => null,
                         'code' => 1,
                         'message' => 'unique map name \'' . $map . '\' is already in use for author ' .
                                      '\'' .  $data['data'][0]['name'] .
                                      ' [' . $data['data'][0]['id'] . ']\'' ];
              }
            }
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "setAuthorMap":
            $aid = $args[0];
            $map = $args[1];
            if ($map == '') {
              // remove existing map
              $query = 'delete from store where key like \'mapper2author:%\' and value = \'"' . $aid . '"\'';
              $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
              if ($data['data']['affected'] == 1) {
                $data['message'] = 'author map deleted for id \'' . $aid . '\'';
              } else {
                $data['code'] = 1;
                $data['message'] = 'author map not deleted for id \'' . $aid . '\'';
              }
            } else {
              // unique map in use?
              $query = 'select trim(value, \'\"\') as id, replace(key, \'mapper2author:\', \'\') as name from store where key = \'mapper2author:' . $map . '\'';
              $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
              if (isSet($data['data']['affected'])) {
                // no matching map found
                $query = 'insert into store values(\'mapper2author:' . $map . '\', \'"' . $aid . '"\')';
                $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
                if (isSet($data['data']['affected'])) {
                  if ($data['data']['affected'] != 1)  {
                    $data['code'] = 1;
                  }
                } else {
                  $data['code'] = 1;
                }
              } else {
                $data = ['data' => null,
                         'code' => 1,
                         'message' => 'unique map name \'' . $map . '\' is already in use for author ' .
                                      '\'' .  $data['data'][0]['name'] .
                                      ' [' . $data['data'][0]['id'] . ']\'' ];
              }
            }
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "setAuthorName":
            $aid = $args[0];
            $name = $args[1] == null ? null : '"' . $args[1] . '"';
            $query = 'update store set value = regexp_replace(value, \'"name":(null|"[^"]*")\', \'"name":' . $name . '\') where key = \'globalAuthor:' . $aid . '\'';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            if (isSet($data['data']['affected'])) {
              if ($data['data']['affected'] != 1) {
                $data = ['data' => null,
                         'code' => 1,
                         'message' => 'failed to set display name for author id \'' . $aid . '\''];
              }
            }
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "deleteAuthor":
            $aid = $args[0];
            $queries = [
              'delete from store where key like \'mapper2author:%\' and value = \'"' . $aid . '"\'',
              'delete from store where key like \'globalAuthor:' . $aid . '\''];
            foreach ($queries as $query) {
              $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            }
            # TODO:
            # better error handling
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "listAllAuthors":
            $query = 'select replace(key, \'globalAuthor:\', \'\') as id, value from store where key like \'globalAuthor:%\'';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            // create json data
            $data2 = [];
            if (isSet($data['data']['affected']))
              $data2 = null;
            else {
              foreach ($data['data'] as $arr) {
                $author = json_decode($arr['value'], true);
                $author['id'] = $arr['id'];
                $data2[$author['id']] = $author;
              }
            }
            $data['data'] = $data2;
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "listAllSessions":
            $query = 'select replace(key, \'session:\', \'\') as id, value from store where key like \'session:%\'';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            // create json data
            $data2 = [];
            if (isSet($data['data']['affected']))
              $data2 = null;
            else {
              foreach ($data['data'] as $arr) {
                $session = json_decode($arr['value'], true);
                $data2[$arr['id']] = [ 'id' => $arr['id'],
                                       'author' => $session['authorID'],
                                       'group' => $session['groupID'],
                                       'expiryUTC' => $session['validUntil'] ];
              }
            }
            $data['data'] = $data2;
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case "cleanDatabase":
            # cleanup
            # 1|deleteStorage: remove session storage records
            # append each query result details
            $data = [];
            $data['code'] = [];
            $data['message'] = [];
            $data['data'] = [];
            # remove session storage records
            # see issue: https://github.com/ether/etherpad-lite/issues/1659
            $query = 'delete from store where key like \'sessionstorage:%\'';
            $qData = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            $data['code']['deleteStorage'] = $qData['code'];
            $data['message']['deleteStorage'] = $qData['message'];
            $data['data']['deleteStorage'] = $qData['data'];
            $data['data']['deleteStorage']['info'] = ($qData['data']['affected'] == 0 ? '' : $qData['data']['affected'] . ' sessionstorage records deleted' );
            $jsonData = $data;
            $sData = var2str($jsonData);
            break;

          case 'test':
            $query = 'select * from store limit 10';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            $sData = var2str($dbSettings) . "\n" .
                     var2str($data);
            $jsonData = $data;
            break;

          case 'help':
            $sReadme = getFileContents('README.md');
            # cut usage section
            $sReadme = substr($sReadme, strpos($sReadme, '### usage') + 10);
            $sReadme = substr($sReadme, 0, strpos($sReadme, '## <p></p>'));
            # strip markdown
            $sReadme = preg_replace('/\*\*(.*?)\*\*' . "\n" . '(?:<br>)?/', '<p style="font-size: 1.1em; margin: 10px 0px 2px;"><b>${1}</b></p>' . "\n", $sReadme);
            $sReadme = preg_replace('/__\*__\s*/', '*', $sReadme);
            $sReadme = preg_replace('/```(.*?)```/s', '<pre>${1}</pre>', $sReadme);

            $data = [ 'code' => 0, 'message' => 'ok', 'data' => [ 'html' => '' . $sReadme . '' ] ];
            $sData = var2str($data);
            $jsonData = $data;
            break;

          default:
            $sData = '[error] unsupported non-api function \'' . $func . '\'';
            error_log($sData);
            break;
        }
        break;
      default:
        $sData = '[error] unsupported database type \'' . $dbSettings['dbType'] . '\'';
        error_log($sData);
        break;
    }
  }
  $sData = json_encode($sData);
  $jsonData = json_encode($jsonData);

  $sReturn = '{"raw":' . $sData . ', "data":' . $jsonData . '}';
  error_log('$sReturn: ' . $sReturn);
  return $sReturn;
}

function epCall($func, $args = [],
                $url = 'http://localhost:9001',
                $apiKeyPath = '/var/www/etherpad-lite/APIKEY.txt') {
  error_log('[debug|epCall]');

  $sData = '';
  $sData = '';
  $jsonData = [ 'code' => 1,
                'message' => '[error] epCall failed',
                'data' => null ];

  $sApiKey = getApiKey($apiKeyPath);
  if($sApiKey) {
    try {
      # create client
      $client = new \EtherpadLite\Client($sApiKey, $url);
      # make call
      $response = $client->__call($func, $args);
      $sData = var2str($response);
      $jsonData = [ 'code' => $response->getCode(),
                    'message' => $response->getMessage(),
                    'data' => $response->getData() ];
    } catch (Exception $e) {
      $sData .= 'exception: ' . $e->getMessage() . '<br>';
    }
  }
  $sData = json_encode($sData);
  $jsonData = json_encode($jsonData);

  $sReturn = '{"raw":' . $sData . ', "data":' . $jsonData . '}';
  error_log('$sReturn: ' . $sReturn);
  return $sReturn;
}

$aEpApi = [ 'checkToken', 'getHTML', 'getPublicStatus', 'deletePad', 'deleteGroup', 'listAllPads', 'listPads', 'listAllGroups', 'createGroupIfNotExistsFor', 'listAuthorsOfPad', 'getAuthorName', 'createAuthorIfNotExistsFor', 'getLastEdited', 'createPad', 'createGroupPad', 'createSession', 'deleteSession', 'getSessionInfo' ];
$aEpX = [ 'help', 'test', 'getGroupMappers', 'deleteAuthor', 'listAllAuthors', 'getAuthorMappers', 'setAuthorMap', 'setAuthorName', 'getPadCreated', 'listAllSessions', 'cleanDatabase' ];

if (!empty($_POST)) {
  if (!empty($_POST['func'])) {
    $func = $_POST['func'];
    $args = [];
    if (!empty($_POST['args']))
      $args = $_POST['args'];
    error_log('$_POST[\'func\'] set as: \'' . $func . '\'');
    error_log('$_POST[\'args\'] set as: \'' . var2str($args) . '\'');

    if (in_array($func, $aEpApi, true)) {
      $url = null;
      $apiKeyPath = null;
      if (!empty($_POST['url']))
        $url = $_POST['url'];
      if (!empty($_POST['apiKeyPath']))
        $apiKeyPath = $_POST['apiKeyPath'];

      error_log('$_POST[\'url\'] set as: \'' . $url . '\'');
      error_log('$_POST[\'apiKeyPath\'] set as: \'' . $apiKeyPath . '\'');
      echo epCall ($func, $args, $url, $apiKeyPath);
    } else if (in_array($func, $aEpX, true)) {
      $settingsPath = null;
      if (!empty($_POST['settingsPath']))
        $settingsPath = $_POST['settingsPath'];

      error_log('$_POST[\'settingsPath\'] set as: \'' . $settingsPath . '\'');
      echo epxCall ($func, $args, $settingsPath);
    } else {
      # unsupported call
      $sData = '[error] unsupported function \'' . $func . '\'';
      $jsonData = [ 'code' => 1 ];
      $sData = json_encode($sData);
      $jsonData = json_encode($jsonData);
      $sReturn = '{"raw":' . $sData . ', "data":' . $jsonData . '}';
      error_log('$sReturn: ' . $sReturn);
      echo $sReturn;
    }
  }
}

?>
