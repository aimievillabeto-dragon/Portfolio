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
        if (in_array($ext, ['css', 'js', 'webp', 'png', 'jpg', 'jpeg', 'svg', 'woff2'], true)) {
            header('Cache-Control: public, max-age=31536000, immutable');
        }
        $canGzip = in_array($ext, ['css', 'js', 'svg'], true)
            && str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip')
            && function_exists('gzencode');
        if ($canGzip) {
            header('Content-Encoding: gzip');
            header('Vary: Accept-Encoding');
            echo gzencode((string) file_get_contents($file), 9);
            return true;
        }
        readfile($file);
        return true;
    }
    return false;
}
require __DIR__.'/public/index.php';
