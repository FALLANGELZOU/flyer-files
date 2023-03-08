#!/bin/bash
echo "开始编译"
nest build 
cp ./package.json ./dist/ 
cp ./package-lock.json ./dist/ 
cp ./Dockerfile ./dist/ 
cp ./.dockerignore ./dist/ 
echo "开始编译docker镜像"
docker image build --platform linux/amd64 -t 'lightsssun/flyer-files:latest' .
echo "删除悬空镜像"
docker image prune -f
echo "开始推送镜像"
docker push lightsssun/flyer-files:latest
echo "完成"