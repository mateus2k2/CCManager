gitLua:
	clear && cd ./../CCManagerLua && git add . && git commit -m "update" && git push origin master

gitWeb:
	clear && cd . && git add . && git commit -m "update" && git push origin master

removeDB:
	docker stop postgres && docker rm postgres

startDB:
	docker run --name postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres 