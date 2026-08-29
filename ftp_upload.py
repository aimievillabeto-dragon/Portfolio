import ftplib
import os
import sys

host = 'ftpupload.net'
user = 'if0_42776222'
password = 'villabeto05'

def ensure_dir(ftp, remote_dir):
    try:
        ftp.cwd(remote_dir)
        ftp.cwd('..')
    except ftplib.error_perm:
        try:
            ftp.mkd(remote_dir)
        except Exception:
            pass

def upload_directory(ftp, local_dir, remote_dir):
    ensure_dir(ftp, remote_dir)
    ftp.cwd(remote_dir)
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        if os.path.isfile(local_path):
            with open(local_path, 'rb') as f:
                print(f"Uploading {local_path} to {remote_dir}/{item}")
                ftp.storbinary(f'STOR {item}', f)
        elif os.path.isdir(local_path):
            if item == 'documents' and 'public' in local_path and 'uploads' in local_path:
                print(f"Skipping {local_path}")
                continue
            upload_directory(ftp, local_path, item)
    ftp.cwd('..')

try:
    print(f"Connecting to FTP {host}...")
    ftp = ftplib.FTP(host)
    ftp.login(user, password)
    print("Logged in successfully.")
    
    ftp.cwd('/htdocs')
    print("Changed to /htdocs directory.")
    
    base_dir = r"c:\Users\ADMIN\Desktop\Portfolio"
    
    # 1. Upload .htaccess
    with open(os.path.join(base_dir, '.htaccess'), 'rb') as f:
        print("Uploading .htaccess")
        ftp.storbinary('STOR .htaccess', f)
        
    # 2. Upload .env
    env_content = """APP_URL=http://ftpupload.net
DB_HOST=sql107.infinityfree.com
DB_PORT=3306
DB_NAME=if0_42776222_portfolio
DB_USER=if0_42776222
DB_PASSWORD=villabeto05
OWNER_EMAIL=aimievillabeto@gmail.com
OWNER_PASSWORD=@avllbt
"""
    env_path = os.path.join(base_dir, 'prod.env')
    with open(env_path, 'w') as f:
        f.write(env_content)
        
    with open(env_path, 'rb') as f:
        print("Uploading .env")
        ftp.storbinary('STOR .env', f)
        
    # 3. Upload app and public directories
    upload_directory(ftp, os.path.join(base_dir, 'app'), 'app')
    upload_directory(ftp, os.path.join(base_dir, 'public'), 'public')
    
    ftp.quit()
    print("Upload completed successfully.")
except Exception as e:
    print(f"FTP Error: {e}")
