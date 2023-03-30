"C:/Program Files (x86)/Toon Boom Animation/Toon Boom Harmony 20 Premium/win64/bin/HarmonyPremium.exe" -batch %1
IF %ERRORLEVEL%==100 SET ERRORLEVEL=0
IF %ERRORLEVEL%==5 SET ERRORLEVEL=5

