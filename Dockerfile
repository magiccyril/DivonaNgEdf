FROM node:0.10

RUN mkdir -p /data
WORKDIR /data
VOLUME ["/data"]

RUN npm install -g bower

ADD docker-entrypoint.sh /data/docker-entrypoint.sh
CMD ["/data/docker-entrypoint.sh"]
