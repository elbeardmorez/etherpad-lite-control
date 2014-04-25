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
  <div id="header" style="z-index: 2; position: absolute; height: 75px; width: 100%;">
    <div id="title" style="position: relative; top: 25px; left: 5px; right: 115px; margin: 0px 1%;">
      <h2>Etherpad-Lite Control</h2>
    </div>
  </div>
  <div id="control-background" style="z-index: 1; position: absolute; top: 75px; right: 0px; bottom: 55px; width: 120px;"></div>
  <div id="control-outer" style="z-index: 1; position: absolute; top: 75px; right: 0px; bottom: 55px; width: 120px; overflow: hidden;">
  <div id="control-inner" style="position: relative; display: table; height: 100%; width: 100%;">

    <p style="margin: 2px 5px;">global</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Authors', 'Groups', 'Pads' ];
      foreach ($controls as $control) {
        echo '<input id="epc' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 5%;"></div>
    <p style="margin: 2px 5px;">group</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Authors', 'Pads' ];
      foreach ($controls as $control) {
        echo '<input id="epcGroup' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName('group' . $control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 5%;"></div>
    <p style="margin: 2px 5px;">pad</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Content' ];
      foreach ($controls as $control) {
        echo '<input id="epcPad' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName('pad' . $control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 80%;"></div>
    <p style="margin: 2px 5px;">misc</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Status' , 'Test' ];
      foreach ($controls as $control) {
        echo '<input id="epc' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

  </div>
  </div>

  <div id="content-outer" style="position: absolute; top: 75px; right: 115px; bottom: 50px; left: 5px; min-width: 750px; overflow: hidden;">
  <div id="content-inner" style="position: relative; height: 100%; width: 98%; margin: auto;">

    <div style="display: block; height: 35%; width: 100%;">
      <div style="position: relative; float: left; display: block; height: 100%; width: 20%; min-width: 175px; max-width: 225px; padding-bottom: 45px;">

        <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 0px;">
          <p style="margin-top: 8px; margin-bottom: 5px;"><b>settings</b></p>
          <div style="position: absolute; top: 35px; bottom: 0px; left: 0px; right: 5px; overflow-y: scroll; overflow-x: hidden;">
            <div style="display: block; margin-right: 10px;">
              <p style="margin-top: 2px; margin-bottom: 1px;">server:</p>
              <input id="epc_server" type=text onchange="if (this.value.length > 0) setCookie(this.id, this.value);" style="width: 100%;">
            </div>
            <div style="display: block; margin-right: 10px;">
              <p style="margin-top: 2px; margin-bottom: 1px;">port:</p>
              <input id="epc_port" type=text onchange="if (this.value.length > 0) setCookie(this.id, this.value);" style="width: 100%;">
            </div>
            <div style="display: block; margin-right: 10px;">
              <p style="margin-top: 2px; margin-bottom: 1px;">base path:</p>
              <input id="epc_basepath" type=text onchange="if (this.value.length > 0) setCookie(this.id, this.value);" style="width: 100%;" disabled>
            </div>
            <div style="display: block; margin-right: 10px;">
              <p style="margin-top: 2px; margin-bottom: 1px;">api key path:</p>
              <input id="epc_apikeypath" type=text onchange="if (this.value.length > 0) setCookie(this.id, this.value);" style="width: 100%;">
            </div>
            <div style="display: block; margin-right: 10px;">
              <p style="margin-top: 2px; margin-bottom: 1px;">settings path:</p>
              <input id="epc_settingspath" type=text onchange="if (this.value.length > 0) setCookie(this.id, this.value);" style="width: 100%;">
            </div>
          </div>
        </div>

      </div>

      <div style="position: relative; float: right; display: block; height: 100%; width: 20%; min-width: 175px; max-width: 400px; padding-bottom: 45px;">

        <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;">
          <p style="margin-top: 8px; margin-bottom: 5px;"><b>info</b></p>
          <div id="epInfo-outer" style="position: absolute; top: 35px; bottom: 0px; width: 100%; overflow: auto;">
          <div id="epInfo-inner" style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 0px;">
          </div>
          </div>
        </div>

      </div>

      <div style="display: block; bottom: 15px; height: 100%; width: auto; min-width: 200px; padding-bottom: 45px; overflow: hidden;">
        <div style="display: block; width: auto; padding: 8px 0px 5px;">
          <p style="margin-top: 5px; margin-bottom: 5px;"><b>status</b></p>
        </div>
        <div id="epStatus-outer" style="display: block; height: 100%;">
        <div id="epStatus-inner" style="display: block; height: 100%; width: 96%; min-width: 300px; overflow-y: auto;">
        </div>
        </div>
      </div>

    </div>
    <div style="clear: both;"></div>

    <div style="position: relative; height: 65%; width: 100%; min-height: 150px;">
    <div style="position: absolute; top: 0px; bottom: 45px; width: 100%;">

      <div style="position: relative; float: left; height: 100%; width: 24%; min-width: 100px;">
        <p id="epAuthorsTitle" style="padding: 0px 5px 0px 5px; font-weight: bold;">authors</p>
        <div style="position: absolute; top: 35px; bottom: 26px; left: 5px; right: 2px;">
          <select id="epAuthors" multiple="multiple" style="height: 100%; width: 100%;">
          </select>
        </div>
        <div style="position: absolute; bottom: 5px; left: 5px; right: 0px; height: 20px;">
          <div style="position: absolute; left: 0px; right: 42px;">
            <input id="epAuthorName" type="text" style="width: 100%;">
          </div>
          <div style="float: right; margin-right: 2px;">
            <input type="button" class="button button-remove" value="-" onclick="epc_authorsRemove();">
          </div>
          <div style="float: right;">
            <input type="button" class="button button-add" value="+" onclick="epc_authorsAdd();">
          </div>
        </div>
      </div>

      <div style="position: relative; float: left; height: 100%; width: 24%; min-width: 100px;">
        <p id="epGroupsTitle" style="padding: 0px 5px 0px 5px; font-weight: bold;">groups</p>
        <div style="position: absolute; top: 35px; bottom: 26px; left: 5px; right: 2px;">
          <select id="epGroups" multiple="multiple" style="height: 100%; width: 100%;">
          </select>
        </div>
        <div style="position: absolute; bottom: 5px; left: 5px; right: 0px; height: 20px;">
          <div style="position: absolute; left: 0px; right: 42px;">
            <input id="epGroupName" type="text" style="width: 100%;">
          </div>
          <div style="float: right; margin-right: 2px;">
            <input type="button" class="button button-remove" value="-" onclick="epc_groupsRemove();">
          </div>
          <div style="float: right;">
            <input type="button" class="button button-add" value="+" onclick="epc_groupsAdd();">
          </div>
        </div>
      </div>

      <div style="position: relative; float: left; height: 100%; width: 30%; min-width: 150px;">
        <p id="epPadsTitle" style="padding: 0px 5px 0px 5px; font-weight: bold;">pads</p>
        <div style="position: absolute; top: 35px; bottom: 30px; left: 5px; right: 2px;">
          <select id="epPadsType" style="width: 100%;" onchange="epc_padsShow(this.value)">
            <option>group (public)</option>
            <option>group (private)</option>
            <option>global</option>
          </select>
        </div>
        <div style="position: absolute; top: 55px; bottom: 26px; left: 5px; right: 2px;">
          <select id="epPads" multiple="multiple" style="top: 20px; height: 100%; width: 100%;" onchange="epc_padsInfo()">
          </select>
        </div>
        <div style="position: absolute; bottom: 5px; left: 5px; right: 0px; height: 20px;">
          <div style="position: absolute; left: 0px; right: 42px;">
            <input id="epPadName" type="text" style="width: 100%;" disabled>
          </div>
          <div style="float: right; margin-right: 2px;">
            <input type="button" class="button button-remove" value="-" onclick="epc_padsRemove();">
          </div>
          <div style="float: right;">
            <input type="button" class="button button-add" value="+" onclick="epc_padsAdd();">
          </div>
        </div>
      </div>

      <div style="position: relative; float: left; height: 100%; width: 22%; min-width: 100px;">
        <p id="epSessionsTitle" style="padding: 0px 5px 0px 5px; font-weight: bold;">sessions</p>
        <div style="position: absolute; top: 35px; bottom: 26px; left: 5px; right: 2px;">
          <select id="epSessions" multiple="multiple" style="height: 100%; width: 100%;">
          </select>
        </div>
        <div style="position: absolute; bottom: 5px; left: 5px; right: 0px; height: 20px;">
          <div style="position: absolute; left: 0px; right: 42px;">
            <input id="epSessionID" type="text" style="width: 100%;" disabled>
          </div>
          <div style="float: right; margin-right: 2px;">
            <input type="button" class="button button-remove" value="-" onclick="epc_sessionsRemove();">
          </div>
          <div style="float: right;">
            <input type="button" class="button button-add" value="+" onclick="epc_sessionsAdd();">
          </div>
        </div>
      </div>

    </div>
    </div>

  </div>
  </div>

  <div id="footer" style="z-index: 2; position: absolute; bottom: 0px; height: 50px; width: 100%;">
  </div>

  <div id="popup-background" class="popup-background" style="z-index: 10; position: absolute; height: 100%; width: 100%;"></div>
  <div id="popup-outer" class="popup-outer" style="z-index: 11; position: absolute; height: 100%; width: 100%;">
  <div id="popup-inner" class="popup-inner" style="position: relative; top: 50%; left: 50%; width: 500px; margin-top: -200px; margin-left: -250px;">
    <h2 id=popupTitle></h2>
    <div id="popupContent" style="position: relative; margin: 5px 5px 40px 5px; max-height: 325px; overflow: auto; border-width: 0px 0px 2px 0px; border-color: #aaa;">
    </div>
    <div id="popupContent" style="position: absolute; bottom: 15px; height: 30px;">
      <input id="popup-button-ok" type="button" class="button">
      <input id="popup-button-cancel" type="button" class="button">
    </div>
  </div>
  </div>

</body>
