FROM node:14.2.0-alpine

RUN mkdir -p /app/dist

WORKDIR /app

RUN apk add --no-cache libcurl

ARG NODE_ENV=production
ARG LOG_LEVEL=warn
ARG DOMAIN=0.0.0.0
ARG PORT=3000
# Should usually stay 0.0.0.0 because of the way fastify and Docker interact.
ARG HOST=0.0.0.0


ENV NODE_ENV=${NODE_ENV} \
  LOG_LEVEL=${LOG_LEVEL} \
  DOMAIN=${DOMAIN} \
  HOST=${HOST} \
  PORT=${PORT} 

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 CMD [ "curl", "${DOMAIN}:${PORT}/healthz"]

COPY package.json package.json

RUN apk add --no-cache --virtual .build-deps python g++ make gcc .build-deps git pixman-dev cairo-dev pangomm-dev libjpeg-turbo-dev giflib-dev \
  && npm install \
  && apk add --no-cache tini \
  && apk del .build-deps 

COPY ./dist ./dist

STOPSIGNAL SIGKILL

EXPOSE 3000

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]

