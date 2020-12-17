#!/bin/bash
WORK_PATH='/usr/local/kai-app/vue-demo-app'
cd $WORK_PATH
echo '先清除老代码'
git reset --hard origin/master
git clean -f
echo '拉取最新代码'
git pull origin master
echo "编译"
npm run build
echo '开始执行构建'
# 去vue-service当前目录下找dockerfile文件
docker build -t vue-app:1.0 .
echo '先停止旧容器并删除旧容器'
docker stop vue-app-container
docker rm vue-app-container
echo '启动新容器'
# nginx服务器，80
docker container run -p 80:80 --name vue-app-container -d vue-app:1.0