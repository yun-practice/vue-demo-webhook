#!/bin/bash
WORK_PATH = '/usr/local/server/vue-demo-service'
cd $WORK_PATH
echo '先清除老代码'
git reset --hard origin/master
git clean -f
echo '拉取最新代码'
git pull origin master
echo '开始执行构建'
# 去vue-service当前目录下找dockerfile文件
docker build -t vue-service:1.0 .
echo '先停止旧容器并删除旧容器'
docker stop vue-service-container
docker rm vue-service-container
echo '启动新容器'
docker container run -p 8083:8083 --name vue-service-container -d vue-service:1.0