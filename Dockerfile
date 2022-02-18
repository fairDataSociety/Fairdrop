FROM ferimer/nginx:spa

COPY build/ /usr/share/nginx/html/

EXPOSE 80
