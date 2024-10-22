FROM nginx:stable-perl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 4561
CMD ["nginx", "-g", "daemon off;"]