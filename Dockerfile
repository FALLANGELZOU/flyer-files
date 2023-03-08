FROM cmntadmin/graphicsmagick-node
COPY ./dist /app
WORKDIR /app
RUN npm install --registry=https://registry.npm.taobao.org
EXPOSE 3000
CMD node main.js