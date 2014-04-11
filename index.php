<?php
include('etherpad-lite.php');

function getFunctionName($s) {
  return lcfirst(str_replace(' ', '', $s));
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>Etherpad-Lite Control</title>
<link rel="stylesheet" type="text/css" href="etherpad-lite.css">
<script type="text/javascript" src="etherpad-lite.js"></script>
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
</head>
<body onload="loadState();">
  <div id="control" style="position: absolute; top: 15px; right: 5px; bottom: 15px; width: 120px;">
    <?php
      $controls = [ 'Status', 'Pads', 'Content' ];
      foreach ($controls as $control) {
        echo '<input type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '">';
      }
    ?>
  </div>
  <div id="content-outer" style="position: absolute; top: 15px; right: 135px; bottom: 5px; left: 5px;">
  <div id="content-inner" style="position: relative; height: 100%; width: 90%; margin: auto;">

    <h2 style="margin-top: 0px; margin-bottom: 5px; ">Etherpad-Lite Control</h2>

    <div style="height: 225px; width: 100%;">

    <div style="float: left; position: relative; height: 100%; width: 175px;">
      <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;">
      <form id="etherpad-lite">
          <p style="margin-top: 8px; margin-bottom: 3px;"><b>settings</b></p>
          <div style="display: block">
            <p style="margin-top: 8px; margin-bottom: 3px;">server:</p>
            <input id="epc_server" type=text size=25 onchange="if (this.value.length > 0) setCookie(this.id, this.value);">
          </div>
          <div style="display: block">
            <p style="margin-top: 8px; margin-bottom: 3px;">port:</p>
            <input id="epc_port" type=text size=25 onchange="if (this.value.length > 0) setCookie(this.id, this.value);">
          </div>
          <div style="display: block">
            <p style="margin-top: 8px; margin-bottom: 3px;">base path:</p>
            <input id="epc_basepath" type=text size=25 onchange="if (this.value.length > 0) setCookie(this.id, this.value);">
          </div>
          <div style="display: block">
            <p style="margin-top: 8px; margin-bottom: 3px;">api version:</p>
            <input id="epc_apiversion" type=text size=25 onchange="if (this.value.length > 0) setCookie(this.id, this.value);">
          </div>
      </form>
      </div>
    </div>
    <div style="float: right; position: relative; height: 100%; width: 30%; width: 175px;">
      <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;">
      <p style="margin-top: 8px; margin-bottom: 5px;"><b>info</b></p>
        <div id="info">
        </div>
      </div>
    </div>

    <div style="position: relative; height: 100%; min-width: 200px; margin: 0px 175px;">
      <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;">
      <p style="margin-top: 8px; margin-bottom: 5px;"><b>status</b></p>
      <div id="epStatus" style="position: absolute; top: 35px; bottom: 0px; width: 100%; overflow: scroll;"> 
      </div>
      </div>
    </div>

    </div>   
    <div style="float: none"></div>
  <!--
  -->
    <div style="display: inline-block;">
      <p id="epGroupsTitle" style="margin-bottom: 5px; font-weight: bold;">groups</p>
      <select id="epGroups" size="20" multiple="multiple" style="min-width: 200px;">
      </select>
    </div>
    <div style="display: inline-block;">
      <p id="epAuthorsTitle" style="margin-bottom: 5px; font-weight: bold;">authors</p>
      <select id="epAuthors" size="20" multiple="multiple" style="min-width: 200px;">
      </select>
    </div>
    <div style="display: inline-block;">
      <p id="epPadsTitle" style="margin-bottom: 5px; font-weight: bold;">pads</p>
      <select id="epPads" size="20" multiple="multiple" style="min-width: 200px;">
      </select>
    </div>

  </div>
  </div>

  <div id="popup-background" class="popup-background" style="position: absolute; height: 100%; width: 100%;"></div>

  <div id="popup-outer" class="popup-outer" style="position: absolute; height: 100%; width: 100%;">
  <div id="popup-inner" class="popup-inner" style="position: relative; top: 50%; left: 50%; height: 400px; width: 500px; margin-top: -200px; margin-left: -250px; overflow: auto;">
    <h2 id=popupTitle></h2>
    <div id="popupContent">
    </div>
    <p>
      <input type="button" class="button" value="close" onclick="popupToggle();">
    </p>
  </div>
  </div>

</body>
