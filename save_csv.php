<?php 
    $data = $_POST;    

    $row = 1;
    $tempArray = [];
    if (($handle = fopen(".\data.csv", "r")) !== FALSE) {
        while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $tempArray[] = $row;
        }
        fclose($handle);
    }
    
    $curTime = new DateTime();
    $tempArray[] = array($curTime->format("U"), $data['update_at'], $data['price']);
    if(sizeof($tempArray) > 10000){
        array_shift($tempArray);
    }

    $file = fopen(".\data.csv","w");
    foreach ($tempArray as $line)    {
        fputcsv($file, $line);
    }
    fclose($file);
?> 