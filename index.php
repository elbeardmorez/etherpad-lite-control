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
<body onload="init();">
  <div id="header" class="fadeIn" style="z-index: 2; position: absolute; height: 15px; width: 100%;"></div>
  <div id="control-background" style="z-index: 10; position: absolute; top: 15px; right: 0px; bottom: 25px; width: 120px;"></div>
  <div id="control-outer" style="z-index: 11; position: absolute; top: 15px; right: 0px; bottom: 25px; width: 120px; overflow: hidden;">
  <div id="control-inner" style="position: relative; display: table; height: 100%; width: 100%;">
    <p style="margin: 2px 5px 10px;"><b>controls</b></p>
    <p style="margin: 2px 5px; font-size: 0.8em;">global</p>
    <hr style="margin: 5px; color: #aaa; background-color: #aaa; border-color: #aaa;">
    <?php
      $controls = [ 'Authors', 'Groups', 'Pads', 'Sessions' ];
      foreach ($controls as $control) {
        echo '<input id="epc' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 5%;"></div>
    <p style="margin: 2px 5px; font-size: 0.8em;">author</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Pads', 'Map', 'Name' ];
      foreach ($controls as $control) {
        echo '<input id="epcGroup' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName('author' . $control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 5%;"></div>
    <p style="margin: 2px 5px; font-size: 0.8em;">group</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Authors', 'Pads' ];
      foreach ($controls as $control) {
        echo '<input id="epcGroup' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName('group' . $control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 5%;"></div>
    <p style="margin: 2px 5px; font-size: 0.8em;">pad</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Content' ];
      foreach ($controls as $control) {
        echo '<input id="epcPad' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName('pad' . $control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

    <div style="display: table-row; height: 80%;"></div>
    <p style="margin: 2px 5px; font-size: 0.8em;">misc</p>
    <hr style="margin: 5px;">
    <?php
      $controls = [ 'Help', 'Status' , 'Test', 'Clean' ];
      foreach ($controls as $control) {
        echo '<input id="epc' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>

  </div>
  </div>

  <div id="content-outer" style="position: absolute; top: 15px; bottom: 15px; width: 100%; min-width: 750px; overflow: hidden;">
  <div id="content-inner" style="position: relative; height: 100%; width: 100%; margin: auto;">

    <div style="position: relative; height: 20%; width: 99%;">
    <div style="position: absolute; top: 0px; bottom: 0px; left: 15px; right: 115px;">
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
          <p id="epInfo-title" style="font-weight: bold; margin-top: 8px; margin-bottom: 5px;">info</p>
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
    </div>
    <div style="clear: both;"></div>


    <!-- banner -->
    <div id="banner" style="z-index: 1; position: relative; top: 45px; height: 10%; min-height: 75px; width: 100%; background-color: #151515;">
      <div class="fadeOut" style="position: absolute; top: 0px; height: 35%; width: 100%;"></div>
      <div class="fadeIn" style="position: absolute; bottom: 0px; height: 35%; width: 100%;"></div>
      <div style="position: absolute; top: 0px; bottom: 0px; height: 35px; left: 15px; right: 115px; margin: auto;">
        <div style="position: relative; width: 250px; margin: auto;">
          <p id="title" style="font-size: 20px; font-weight: bold; text-align: center; margin: auto;" onclick="location.reload(true);"><img src="resources/icon.png" style="position: relative; bottom: 5px; height: 40px; opacity: 0.7; padding-right: 5px; vertical-align: middle;">Etherpad-Lite Control</p>
        </div>
      </div>
    </div>


    <div style="position: relative; height: 70%; width: 99%; min-height: 150px;">
    <div style="position: absolute; top: 35px; bottom: 35px; left: 15px; right: 115px;">

      <div style="position: relative; float: left; height: 100%; width: 24%; min-width: 100px;">
        <p id="epAuthorsTitle" style="padding: 0px 5px 0px 5px; font-weight: bold;">authors</p>
        <div style="position: absolute; top: 35px; bottom: 26px; left: 5px; right: 2px;">
          <select id="epAuthors" multiple="multiple" style="height: 100%; width: 100%;" onclick="if (this.value == 'All') selectAll(this); else  selection(authorsSelected, this.selectedOptions, $('#epAuthorName')); epc_authorsInfoShow();">
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
          <select id="epGroups" multiple="multiple" style="height: 100%; width: 100%;" onclick="if (this.value == 'All') selectAll(this); else selection(groupsSelected, this.selectedOptions, $('#epGroupName'));">
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
          </select>
        </div>
        <div style="position: absolute; top: 55px; bottom: 26px; left: 5px; right: 2px;">
          <select id="epPads" multiple="multiple" style="top: 20px; height: 100%; width: 100%;" onclick="if (this.value == 'All') selectAll(this); else selection(padsSelected, this.selectedOptions, $('#epPadName')); epc_padsInfoShow();">
          </select>
        </div>
        <div style="position: absolute; bottom: 5px; left: 5px; right: 0px; height: 20px;">
          <div style="position: absolute; left: 0px; right: 42px;">
            <input id="epPadName" type="text" style="width: 100%;">
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
          <select id="epSessions" multiple="multiple" style="height: 100%; width: 100%;" onclick="if (this.value == 'All') selectAll(this); epc_sessionsInfoShow();">
          </select>
        </div>
        <div style="position: absolute; bottom: 5px; left: 5px; right: 0px; height: 20px;">
          <div style="float: left; margin-right: 2px;">
            <input type="button" class="button button-remove" value="-" onclick="epc_sessionsRemove();">
          </div>
          <div style="position: absolute; left: 21px; right: 21px;">
            <div style="position: relative; float: left; width: 32%; margin-right: -5px;">
              <input id="epSessionExpiry" type="text" style="width: 100%; text-align: right;">
            </div>
            <div style="position: relative; float: right; width: 65%; margin-right: -1px;">
              <select id="epSessionExpiry2" style="width: 100%;">
                <option>minute(s)</option>
                <option>hour(s)</option>
                <option>day(s)</option>
                <option>week(s)</option>
                <option>month(s)</option>
                <option>year(s)</option>
             </select>
            </div>
          </div>
          <div style="float: right; margin-right: 2px;">
            <input type="button" class="button button-add" value="+" onclick="epc_sessionsAdd();">
          </div>
        </div>
      </div>

    </div>
    </div>

  </div>
  </div>

  <div id="footer" class="fadeOut" style="z-index: 2; position: absolute; bottom: 0px; height: 15px; width: 100%;">
  </div>

  <div id="popup-background" class="popup-background" style="z-index: 100; position: absolute; height: 100%; width: 100%;"></div>
  <div id="popup-outer" class="popup-outer" style="z-index: 101; position: absolute; height: 100%; width: 100%;">
  <div id="popup-inner" class="popup-inner" style="position: relative; top: 50%; left: 50%; width: 500px; margin-top: -200px; margin-left: -250px;">
    <h2 id=popupTitle></h2>
    <div style="position: relative; margin: 5px 0px 40px 0px; max-height: 325px; overflow: auto; border-width: 0px; border-color: #aaa;">
      <div id="popupContent" style="position: relative;">
      </div>
      <div id="popupInput" style="position: relative; height: 30px; width: 100%; margin: 0px;">
        <input id="popup-input" type="input" style="width: 98%; margin: 0px auto;">
      </div>
    </div>
    <div id="popupButtons" style="position: absolute; bottom: 15px; height: 30px;">
      <input id="popup-button-1" type="button" class="button">
      <input id="popup-button-2" type="button" class="button">
      <input id="popup-button-3" type="button" class="button">
    </div>
  </div>
  </div>

</body>
