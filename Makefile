# ----------------------------------------
# --GIT
# ----------------------------------------

gitLuaMini:
	clear && echo "gitLuaMini" && cd ./../CCManagerLuaMini && git add . && git commit -m "update" | true  && git push origin master

gitLua:
	clear && echo "gitLua" && cd ./../CCManagerLua && git add . && git commit -m "update" | true  && git push origin master

gitWeb:
	clear && echo "gitWeb" && cd . && git add . && git commit -m "update" | true && git push origin master

# ----------------------------------------
# --NPM
# ----------------------------------------

startBack:
	clear && cd backend && node server.js

startFront:
	clear && cd frontend && npm run start

startMinify:
	clear && cd goMinify && npm run minify


# ----------------------------------------
# --GO
# ----------------------------------------

goLua:
	clear && make startMinify && make gitLua && make gitLuaMini