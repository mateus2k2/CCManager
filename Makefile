# ----------------------------------------
# --GIT
# ----------------------------------------

gitLuaMini:
	clear && cd ./../CCManagerLuaMini && git add . && git commit -m "update" | true  && git push origin master

gitLua:
	clear && cd ./../CCManagerLua && git add . && git commit -m "update" | true  && git push origin master

gitWeb:
	clear && cd . && git add . && git commit -m "update" | true && git push origin master

# ----------------------------------------
# --NPM
# ----------------------------------------

startBack:
	clear && cd backend && npm run start

startFront:
	clear && cd frontend && npm run start

startMinify:
	clear && cd goMinify && npm run minify

# ----------------------------------------
# --DB
# ----------------------------------------

removeDB:
	clear && docker stop postgres && docker rm postgres

startDB:
	clear && docker start postgres 

createDB:
	clear && docker run --name postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres 

# ----------------------------------------
# --GO
# ----------------------------------------

goLua:
	clear && make startMinify && make gitLua && make gitLuaMini