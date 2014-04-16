<?php

function var2string($v, $l) {
  $s = '';;
  $s .= '<pre>';
  ob_start();
  var_dump($v, $l);
  $s .= ob_get_contents();
#  $s .= htmlspecialchars(ob_get_contents(), ENT_QUOTES);
  ob_end_clean();
  $s .= '</pre>';
  return $s;
}

function getFileContents($path) {
  $sContents = '';
  if (is_readable($path)) {
    $f = fopen($path, 'r');
    $sContents = fread($f, filesize($path));
    fclose($f);
  }
  return $sContents;
}

?>
