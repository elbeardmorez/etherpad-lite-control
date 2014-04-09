<?php

include ('vendor/autoload.php');
include ('tools.php');

function getApiKey() {
  $sApiKeyPath = '/var/www/etherpad-lite-dev/APIKEY.txt';
  $fApiKey = fopen($sApiKeyPath, 'r');
  $sApiKey = fread($fApiKey, filesize($sApiKeyPath));
  fclose($fApiKey);
  if(!$sApiKey) {
    $sApiKey = '';
    error_log('[error] cannot read etherpad-lite api key from path \'' . $sApiKeyPath . '\'');
  }
  
#  error_log('[info] sApiKey: \'' . $sApiKey . '\'');
  return $sApiKey;
}

function epCall($func, $url = '') {
  
  error_log('[debug|epCall]');

  $sData = '';
  $sApiKey = getApiKey();
  if($sApiKey) {
    try {
      # create client
      $client = new \EtherpadLite\Client($sApiKey, $url);
      # make call  
      $response = $client->__call($func, $args);
      $sData .= 'response->getCode(): \'' . $response->getCode() . '\'<br>';
      $sData .= 'response->getMessage(): \'' . $response->getMessage() . '\'<br>';
      $sData .= 'response->getData(): \'' . var2string($response->getData()) . '\'<br>';
    } catch (Exception $e) {
      $sData .= 'exception: ' . $e->getMessage() . '<br>';
    }
  }

  $sReturn = $sData;
  error_log('$sReturn: ' . $sReturn);
  return $sReturn;  
}

if (!empty($_POST)) {
  $func = '';
  $url = '';
  if (!empty($_POST['func'])) {
    $func = $_POST['func'];
    if (!empty($_POST['url']))
      $url = $_POST['url'];
    
    error_log('$_POST[\'func\'] set as: \'' . $func . '\'');
    error_log('$_POST[\'url\'] set as: \'' . $url . '\'');
    echo epCall ($func, $url);
  }
}

?>
