# ---- 构建阶段 ----
# 使用 Node.js Alpine 作为基础镜像，体积小、构建快
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm 包管理器
# 使用 pnpm 可以更快地安装依赖，且磁盘空间占用更少
RUN npm install -g pnpm

# 首先只复制 package.json 和 lock 文件
# 这样可以利用 Docker 的缓存机制，如果依赖没有变化，就不会重新安装
COPY package.json pnpm-lock.yaml ./

# 安装项目依赖
# 使用 pnpm 安装所有依赖
RUN pnpm install

# 复制其余源代码
# 将所有源代码复制到容器中
COPY . .

# 构建前端应用
# 执行生产环境构建
RUN pnpm build

# ---- 生产阶段 ----
# 使用 nginx alpine 作为基础镜像，提供静态文件服务
FROM nginx:alpine

# 复制 nginx 配置
# 将自定义的 nginx 配置复制到容器中
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
# 将构建好的静态文件复制到 nginx 的默认静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
# nginx 默认监听 80 端口
EXPOSE 80

# 启动 Nginx
# 前台运行 nginx，这样容器就不会自动退出
CMD ["nginx", "-g", "daemon off;"] 