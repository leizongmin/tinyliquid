@echo off
cmd /c browserify -e ./lib/index.js -s TinyLiquid -o ./target/tinyliquid.js
cmd /c uglifyjs ./target/tinyliquid.js -o ./target/tinyliquid.min.js
echo done.