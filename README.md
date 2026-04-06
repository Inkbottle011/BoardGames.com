Prerequisites — Install in this order:

1. Laravel Herd (recommended — installs PHP automatically)
   - Download from: https://herd.laravel.com
   - Run the installer and follow the setup wizard
   - Herd manages PHP for you — if using Herd, skip step 2
   - After installing, open Herd and make sure it is running in the system tray

2. PHP 8.2+ (skip if using Herd)
   - Herd installs PHP at:
     C:\Users\YOUR_NAME\AppData\Local\Herd\bin\php.exe
   - You need to add PHP to your system PATH so the terminal can find it:
     1. Press Windows key and search "Environment Variables"
     2. Click "Edit the system environment variables"
     3. Click "Environment Variables" button
     4. Under "System Variables" find "Path" and click Edit
     5. Click New and add: C:\Users\YOUR_NAME\AppData\Local\Herd\bin
        (replace YOUR_NAME with your Windows username)
     6. Click OK on all windows
     7. Close and reopen your terminal
   - Verify PHP is working: php --version
   - You should see: PHP 8.2.x or higher

3. Composer
   - Download from: https://getcomposer.org/download
   - Under "Windows Installer" click "Composer-Setup.exe"
   - Run the installer
   - When prompted to select a PHP executable, point it to:
     - If using Herd: C:\Users\YOUR_NAME\AppData\Local\Herd\bin\php.exe
     - If using standalone PHP: C:\php\php.exe
   - Leave all other settings as default and click Next
   - Finish the installation
   - Close and reopen your terminal
   - Verify install: composer --version
   - You should see: Composer version 2.x.x

4. Node.js 18+
   - Download from: https://nodejs.org
   - Download and install the LTS (Long Term Support) version
   - Leave all installer options as default
   - Close and reopen your terminal after installing
   - Verify install: node --version
   - You should see: v18.x.x or higher
   - Also verify npm: npm --version

5. MySQL
   - Download from: https://dev.mysql.com/downloads/mysql
   - Download MySQL Community Server
   - During installation choose "Developer Default" setup type
   - Set a root password when prompted — remember this password,
     you will need it for the .env file
   - Complete the installation
   - Verify install: mysql --version

6. VS Code
   - Download from: https://code.visualstudio.com
   - Run the installer with default options
   - Open VS Code after installation

Setup Steps:

1. Clone or unzip the project
   - Git: git clone https://github.com/Inkbottle011/BoardGames.com
   - Or unzip the provided zip file to a folder of your choice

2. Open a terminal in the project folder
   - In VS Code: Terminal → New Terminal
   - Or navigate to the folder in File Explorer, right click → Open in Terminal

3. Install PHP dependencies
   - Run: composer install
   - This may take a few minutes on first run
   - You should see "Generating optimized autoload files" when done

4. Create your environment file
   - Run: cp .env.example .env
   - On Windows if cp doesn't work: copy .env.example .env

5. Generate application key
   - Run: php artisan key:generate
   - This fills in the APP_KEY value in your .env automatically

6. Configure your database
   - Open the .env file in VS Code
   - Find and update these lines:
     DB_DATABASE=boardgames
     DB_USERNAME=root  (or your MySQL username)
     DB_PASSWORD=your_mysql_password

7. Generate Reverb WebSocket credentials
   - Run: php artisan reverb:install
   - This automatically adds REVERB_APP_ID, REVERB_APP_KEY,
     and REVERB_APP_SECRET to your .env file

8. Configure your IP address (required for multiplayer)
   - Open a terminal and run: ipconfig (Windows) or ifconfig (Mac)
   - Find your IPv4 Address under "Wireless LAN adapter Wi-Fi"
   - Example: 192.168.1.100
   - Open .env and update these three lines with your IP:
     APP_URL=http://YOUR_IP:9000
     REVERB_HOST=YOUR_IP
     VITE_DEV_SERVER_URL=http://YOUR_IP:5173

9. Set up the database
   - Run: php artisan migrate
   - When asked to create the database, type: yes
   - Run: php artisan db:seed

10. Install JavaScript dependencies
    - Run: npm install
    - This may take a few minutes

11. Build frontend assets
    - Run: npm run build

Running the project (open 4 separate terminals):

   Terminal 1 — Laravel web server:
   php artisan serve --host=0.0.0.0 --port=9000

   Terminal 2 — Reverb WebSocket server:
   php artisan reverb:start --host=0.0.0.0 --port=8080

   Terminal 3 — Queue worker (handles broadcasts):
   php artisan queue:work

   Terminal 4 — Scheduler (handles lobby cleanup):
   php artisan schedule:work

Visit: http://YOUR_IP:9000
(replace YOUR_IP with the IP address you found in step 8)

Note: All 4 terminals must be running at the same time for
the game to work correctly. If WebSockets are not connecting,
make sure port 8080 is allowed through your firewall.

How to play:
1. Click on Doomlings from the home page
2. Log in or register an account
3. Create a game or join an existing one from the lobby
4. Wait for other players to join
   - For testing on one device: open another browser or
     incognito tab and log in as a different account
5. Host clicks Start Game when ready (minimum 2 players)
6. Take turns playing one trait card per turn from your hand
7. Game ends after 3 catastrophes — highest score wins