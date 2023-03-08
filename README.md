## Description
Flyer Files, a system of storing file data

## Running the app in Docker

```bash
docker volume create flyer-data

docker container run --rm -p 3000:3000 -it --platform linux/amd64  -v flyer-data/flyer-files:/app lightsssun/flyer-files:latest
```

## License

Nest is [MIT licensed](LICENSE).
