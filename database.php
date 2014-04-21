<?php

# connection
function dbConnect($dbType, $dbConnectionString) {
  error_log('[debug|dbConnect]');

  $dbc = null;
  switch ($dbType) {
    case "postgres":
      $dbc = pg_connect($dbConnectionString)
                 or die('[error] cannot connect to postgres instance ' .
                        'using connection string:' . "\n" .
                        $dbConnectionString . "\n" .
                        'error: ' . pg_last_error());
      break;
    default:
      $sData = '[info] unsupported database type \'' . $dbSettings['dbType'] . '\'';
      error_log($sData);
      break;
  }
  return $dbc;
}

# query
function dbQuery($dbType, $dbConnectionString, $query) {
  error_log('[debug|dbQuery]');

  $data = [ 'code' => 1,
            'message' => '[error] dbQuery failed',
            'data' => null ];
  $dbc = dbConnect($dbType, $dbConnectionString);
  if ($dbc) {
    switch ($dbType) {
      case "postgres":
        $result = pg_query($query)
                    or die('Query failed: ' . pg_last_error());

        $data['code'] = 0;
        $data['message'] = 'ok';
        # process result set
        if (pg_num_rows($result) > 0) {
          $data2 = [];
          $headers = [];
          $lFields = pg_num_fields($result);
          for ($l = 0; $l < $lFields; $l++) {
            $headers[] = pg_field_name($result, $l);
          }
          while ($record = pg_fetch_array($result, null, PGSQL_ASSOC)) {
            $l = 0;
            $data3 = [];
            foreach ($record as $field) {
              $data3[$headers[$l]] = $field;
              $l++;
            }
            $data2[] = $data3;
          }
          $data['data'] = $data2;
        }

        # clean up
        pg_free_result($result);
        pg_close($dbc);

        break;
      default:
        $sData = '[info] unsupported database type \'' . $dbSettings['dbType'] . '\'';
        error_log($sData);
        break;
    }
  }
  return $data;
}

?>
