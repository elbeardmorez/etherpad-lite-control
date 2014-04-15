<?php

include ('vendor/autoload.php');
include ('tools.php');

function getApiKey($apiKeyPath) {
  $fApiKey = fopen($apiKeyPath, 'r');
  $sApiKey = fread($fApiKey, filesize($apiKeyPath));
  fclose($fApiKey);
  if(!$sApiKey) {
    $sApiKey = '';
    error_log('[error] cannot read etherpad-lite api key from path \'' . $apiKeyPath . '\'');
  }
  
#  error_log('[info] sApiKey: \'' . $sApiKey . '\'');
  return $sApiKey;
}

function epCall($func, $args = [],
                $url = 'http://localhost:9001', 
                $apiKeyPath = '/var/www/etherpad-lite/APIKEY.txt') {
  
  error_log('[debug|epCall]');

  error_log('$url: ' . $url);
  error_log('$apiKeyPath: ' . $apiKeyPath);

  $sData = '';
  $jsonData = null;

  $sApiKey = getApiKey($apiKeyPath);
  if($sApiKey) {
    try {
      # create client
      $client = new \EtherpadLite\Client($sApiKey, $url);
      # make call  
      $response = $client->__call($func, $args);
      $sData = var2string($response, 3);
      $jsonData = [ 'code' => $response->getCode(),
                    'message' => $response->getMessage(),
                    'data' => $response->getData() ];
    } catch (Exception $e) {
      $sData .= 'exception: ' . $e->getMessage() . '<br>';
    }
    $sData = json_encode($sData);
    $jsonData = json_encode($jsonData);
  }

  $sReturn = '{"raw":' . $sData . ', "data":' . $jsonData . '}';
  error_log('$sReturn: ' . $sReturn);
  return $sReturn;  
}

if (!empty($_POST)) {
  $func = null;
  $args = [];
  $url = null;
  $apiKeyPath = null;
  if (!empty($_POST['func'])) {
    $func = $_POST['func'];
    if (!empty($_POST['args']))
      $args = $_POST['args'];
    if (!empty($_POST['url']))
      $url = $_POST['url'];
    if (!empty($_POST['apiKeyPath']))
      $apiKeyPath = $_POST['apiKeyPath'];

    error_log('$_POST[\'func\'] set as: \'' . $func . '\'');
    error_log('$_POST[\'args\'] set as: \'' . var2string($args) . '\'');
    error_log('$_POST[\'url\'] set as: \'' . $url . '\'');
    error_log('$_POST[\'apiKeyPath\'] set as: \'' . $apiKeyPath . '\'');
    echo epCall ($func, $args, $url, $apiKeyPath);
  }
}

?>
