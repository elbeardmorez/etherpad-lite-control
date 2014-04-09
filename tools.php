<?php

function var2string($v) {
  $s = '';;
  $s .= '<pre>';
  ob_start();
  var_dump($v);
  $s .= ob_get_contents();
#  $s .= htmlspecialchars(ob_get_contents(), ENT_QUOTES);
  ob_end_clean();
  $s .= '</pre>';
  return $s;
}

?>
