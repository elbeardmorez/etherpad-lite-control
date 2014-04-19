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
  <div id="header" style="position: absolute; height: 75px; width: 100%;">
    <div id="title" style="position: relative; top: 25px; left: 5px; right: 135px; margin: 0px 2.5%;">
      <h2>Etherpad-Lite Control</h2>
    </div>
  </div>
  <div id="control-background" style="z-index: 1; position: absolute; top: 75px; right: 0px; bottom: 55px; width: 120px;"></div>
  <div id="control-outer" style="z-index: 1; position: absolute; top: 75px; right: 0px; bottom: 55px; width: 120px;">
  <div id="control-inner" style="position: relative; display: table; height: 100%; width: 100%;">
    <?php
      $controls = [ 'Status', 'Groups', 'Authors', 'Pads', 'Content' ];
      foreach ($controls as $control) {
        echo '<input id="epc' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }
    ?>
    <div style="display: table-row; height: 100%;"></div>
    <?php
      $controls = [ 'Test' ];
      foreach ($controls as $control) {
        echo '<input id="epc' . $control . '" type="button" class="button" onclick="epc_' . getFunctionName($control) . '()" value="' . $control . '" style="margin-left: 10px;">';
      }

    ?>
  </div>
  </div>

  <div id="content-outer" style="position: absolute; top: 75px; right: 135px; bottom: 50px; left: 5px; min-width: 700px; overflow: hidden;">
  <div id="content-inner" style="position: relative; height: 100%; width: 95%; margin: auto;">


    <div style="height: 200px; width: 100%;">
      <div style="float: left; position: relative; height: 100%; width: 200px;">
        <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 0px;">
          <p style="margin-top: 8px; margin-bottom: 5px;"><b>settings</b></p>
          <div style="position: absolute; top: 35px; bottom: 0px; left: 5px; right: 5px; overflow-y: scroll; overflow-x: hidden;">
            <form id="etherpad-lite">
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
            </form>
          </div>
        </div>
      </div>
      <div style="float: right; position: relative; height: 100%; width: 30%; width: 175px;">
        <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;">
          <p style="margin-top: 8px; margin-bottom: 5px;"><b>info</b></p>
          <div id="epInfo-outer" style="position: absolute; top: 35px; bottom: 0px; width: 100%; overflow: auto;">
          <div id="epInfo-inner" style="position: relative;">
          </div>
          </div>
        </div>
      </div>

      <div style="position: relative; height: 100%; min-width: 200px; margin: 0px 175px 0px 200px;">
        <div style="position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;">
          <p style="margin-top: 8px; margin-bottom: 5px;"><b>status</b></p>
          <div id="epStatus-outer" style="position: absolute; top: 35px; bottom: 0px; width: 100%; overflow: auto;">
          <div id="epStatus-inner" style="position: relative;">
          </div>
          </div>
        </div>
      </div>
    </div>

    <div style="float: none"></div>

    <div style="position: relative; height: 225px; width: 100%;">
      <div style="display: block; float: left; width: 30%; min-width: 150px; margin: auto;">
        <p id="epGroupsTitle" style="margin-bottom: 5px; font-weight: bold;">groups</p>
        <select id="epGroups" multiple="multiple" style="height: 218px; width: 100%;">
        </select>
        <div style="position: relative; height: 20px; width: 100%;">
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
      <div style="display: block; float: left; width: 30%; min-width: 150px; margin: auto;">
        <p id="epAuthorsTitle" style="margin-bottom: 5px; font-weight: bold;">authors</p>
        <select id="epAuthors" multiple="multiple" style="height: 218px; width: 100%;">
        </select>
        <div style="position: relative; height: 20px; width: 100%;">
          <div style="position: absolute; left: 0px; right: 42px;">
            <input id="epAuthorName" type="text" style="width: 100%;" disabled>
          </div>
          <div style="float: right; margin-right: 2px;">
            <input type="button" class="button button-remove" value="-" onclick="epc_authorsRemove();">
          </div>
          <div style="float: right;">
            <input type="button" class="button button-add" value="+" onclick="epc_authorsAdd();">
          </div>
        </div>
      </div>
      <div style="display: block; float: left; width: 40%; min-width: 150px; margin: auto;">
        <p id="epPadsTitle" style="margin-bottom: 5px; font-weight: bold;">pads</p>
        <select id="epPadsType" style="width: 100%;" onchange="epc_padsShow(this.value)">
          <option></option>
          <option>Public</option>
          <option>Private</option>
        </select>
        <select id="epPads" multiple="multiple" style="height: 200px; width: 100%;">
        </select>
        <div style="position: relative; height: 20px; width: 100%;">
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
    </div>

  </div>
  </div>

  <div id="footer" style="position: absolute; bottom: 0px; height: 50px; width: 100%;">
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
