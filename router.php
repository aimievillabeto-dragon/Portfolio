<?php
declare(strict_types=1);
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
$file=__DIR__.'/public'.$path;
if($path!=='/'&&is_file($file)){
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = match($ext) {
        'css' => 'text/css',
        'js' => 'application/javascript',
        'webp' => 'image/webp',
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'svg' => 'image/svg+xml',
        'pdf' => 'application/pdf',
        default => null,
    };
    if ($mime) {
        header("Content-Type: {$mime}");
        readfile($file);
        return true;
    }
    return false;
}
require __DIR__.'/public/index.php';
