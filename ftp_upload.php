<?php
$host = 'ftpupload.net';
$user = 'if0_42776222';
$password = 'villabeto05';

$conn = ftp_connect($host);
if (!$conn) {
    die("Could not connect to $host\n");
}

$login = ftp_login($conn, $user, $password);
if (!$login) {
    die("Could not login\n");
}

ftp_pasv($conn, true);
echo "Connected successfully.\n";

if (!ftp_chdir($conn, 'htdocs')) {
    die("Could not change dir to htdocs\n");
}

function upload_dir($conn, $local_dir, $remote_dir) {
    echo "Uploading directory $local_dir to $remote_dir\n";
    @ftp_mkdir($conn, $remote_dir);
    if (!ftp_chdir($conn, $remote_dir)) {
        echo "Failed to cd into $remote_dir\n";
        return;
    }
    
    $files = scandir($local_dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $local_path = $local_dir . '/' . $file;
        
        if (is_dir($local_path)) {
            if ($file === 'documents' && strpos(str_replace('\\', '/', $local_path), 'public/uploads/documents') !== false) {
                echo "Skipping $local_path\n";
                continue;
            }
            upload_dir($conn, $local_path, $file);
        } else {
            echo "Uploading file $local_path as $file\n";
            if (!ftp_put($conn, $file, $local_path, FTP_BINARY)) {
                echo "Failed to upload $local_path\n";
            }
        }
    }
    ftp_cdup($conn);
}

$base_dir = __DIR__;

echo "Uploading .htaccess...\n";
if (!ftp_put($conn, '.htaccess', $base_dir . '/.htaccess', FTP_BINARY)) {
    echo "Failed to upload .htaccess\n";
}

echo "Uploading .env...\n";
if (!ftp_put($conn, '.env', $base_dir . '/prod.env', FTP_BINARY)) {
    echo "Failed to upload .env\n";
}

upload_dir($conn, $base_dir . '/app', 'app');
upload_dir($conn, $base_dir . '/public', 'public');

ftp_close($conn);
echo "Upload completed.\n";
