jscover lib lib-cov
set TINYLIQUID_COV=true
mocha -R html-cov test/ --coverage > coverage.html
