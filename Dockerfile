FROM node:lts as build

ARG REACT_APP_ENV_NAME
ARG REACT_APP_DOMAIN_NAME
ARG REACT_APP_BEE_GATEWAY
ARG REACT_APP_ETH_GATEWAY
ARG REACT_APP_CHAIN_ID
ARG REACT_APP_ENS_ADDRESS
ARG REACT_APP_REGISTRAR_ADDRESS
ARG REACT_APP_RESOLVER_ADDRESS
ENV REACT_APP_ENV_NAME=$REACT_APP_ENV_NAME
ENV REACT_APP_DOMAIN_NAME=$REACT_APP_DOMAIN_NAME
ENV REACT_APP_BEE_GATEWAY=$REACT_APP_BEE_GATEWAY
ENV REACT_APP_ETH_GATEWAY=$REACT_APP_ETH_GATEWAY
ENV REACT_APP_CHAIN_ID=$REACT_APP_CHAIN_ID
ENV REACT_APP_DTRANSFER_HOST=$REACT_APP_DTRANSFER_HOST
ENV REACT_APP_ENS_ADDRESS=$REACT_APP_ENS_ADDRESS
ENV REACT_APP_REGISTRAR_ADDRESS=$REACT_APP_REGISTRAR_ADDRESS
ENV REACT_APP_RESOLVER_ADDRES=$REACT_APP_RESOLVER_ADDRES

WORKDIR /base
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN env |grep REACT > .env

COPY yarn.lock .
COPY *.json .
RUN yarn install
COPY . .
RUN yarn build

#webserver
FROM nginx:stable-alpine
COPY --from=build /base/build /usr/share/nginx/html
RUN echo "real_ip_header X-Forwarded-For;" \
    "real_ip_recursive on;" \
    "set_real_ip_from 0.0.0.0/0;" > /etc/nginx/conf.d/ip.conf
RUN sed -i '/index  index.html index.htm/c\        try_files $uri /index.html;' /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

