## Description
Flyer Files, a system of storing file data

## Running the app in Docker

```bash

docker pull lightsssun/flyer-files:latest

docker volume create flyer-data

docker container run --rm -p 3001:3001 -it --platform linux/amd64  -v flyer-data:/app/resource lightsssun/flyer-files:latest

```

## License

Flyer-Files is [MIT licensed](LICENSE).
