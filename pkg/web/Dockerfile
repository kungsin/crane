# # -- BUILD --
# FROM node:14.17-alpine as build

# WORKDIR /usr/src/app

# COPY package* ./
# COPY . .

# RUN npm i
# RUN npm run build

# # -- RELEASE --
# FROM nginx:stable-alpine as release

# COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# WORKDIR /usr/share/nginx/html
# EXPOSE 9090

# CMD ["/bin/sh", "-c", "nginx -g \"daemon off;\""]


# 使用官方的Nginx镜像作为基础镜像
FROM nginx:alpine

# 将当前目录下的dist文件夹复制到Nginx的默认静态文件目录
COPY dist /usr/share/nginx/html

# 暴露80端口
EXPOSE 80

# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]