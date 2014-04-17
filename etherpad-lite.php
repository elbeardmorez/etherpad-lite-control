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
          case 'test':
            $query = 'select * from store limit 10';
            $data = dbQuery($dbSettings['type'], $dbConnectionString, $query);
            $sData = var2str($dbSettings) . "\n" .
                     var2str($data);
            $jsonData = $data;
            break;
          default:
            $sData = '[info] unsupported non-api function \'' . $func . '\'';
            error_log($sData);
            break;
        }
        break;
      default:
        $sData = '[info] unsupported database type \'' . $dbSettings['dbType'] . '\'';
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

#  error_log('$url: ' . $url);
#  error_log('$apiKeyPath: ' . $apiKeyPath);

  $sData = '';
  $jsonData = null;

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

$aEpApi = [ 'checkToken', 'getHTML', 'getPublicStatus', 'deletePad', 'deleteGroup', 'listAllPads', 'listAllGroups', 'createGroupIfNotExistsFor', 'listAuthorsOfPad', 'getAuthorName' ];
$aEpX = [ 'test' ];

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
    }
  }
}

?>
