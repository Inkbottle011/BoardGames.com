@echo off
cd /d C:\Users\gaura\Herd\boardgames.com
start cmd /k "cd /d C:\Users\gaura\Herd\boardgames.com && npm run dev"
start cmd /k "cd /d C:\Users\gaura\Herd\boardgames.com && php artisan reverb:start"
start cmd /k "cd /d C:\Users\gaura\Herd\boardgames.com && php artisan queue:work"
start cmd /k "cd /d C:\Users\gaura\Herd\boardgames.com && php artisan schedule:work"
echo All services started!
pause