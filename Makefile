gitLua:
	clear && cd ./../CCManagerLua && git add . && git commit -m "update" && git push origin master

gitWeb:
	clear && cd . && git add . && git commit -m "update" && git push origin master

startBack:
	clear && cd backend && npm run start

startFront:
	clear && cd frontend && npm run start
	
removeDB:
	clear && docker stop postgres && docker rm postgres

startDB:
	clear && docker start postgres 

createDB:
	clear && docker run --name postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres 