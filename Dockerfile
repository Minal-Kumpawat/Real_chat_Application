FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sl https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY index.js index.js

RUN npm install

ENTRYPOINT ["node", "index.js"]
