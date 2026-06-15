<?php

$RemoteHostArray = explode(".", gethostbyaddr($_SERVER['REMOTE_ADDR']));
$RemoteHost = ucfirst($RemoteHostArray[0]);

if(isset($_GET["name"])) { $RemoteHost = $_GET["name"]; }

require __DIR__ . '/vendor/autoload.php';

use Povils\Figlet\Figlet;

// Default font is "big"
$figlet = new Figlet();

//Outputs "Figlet" text using "small" red font in blue background.
$figlet
    ->setFont('big')
    ->write($RemoteHost);
?>
