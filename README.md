本项目实现：

- 后端使用 Node.js + Express，连接国产数据库 openGauss。
- 提供任务管理 CRUD API 与简易前端页面。
- 重点展示数据库设计、部署、访问：包含模式定义、初始化与连接配置。
- 使用 Docker 与 docker-compose 一键封装部署。


## 本地运行

### 1. 安装依赖

```
npm install
```

### 2. 配置环境

复制 `.env.example` 为 `.env` 并按需修改数据库连接信息。

### 3. 启动 openGauss 数据库（Docker）

需要已安装 Docker Desktop。

```
docker run -d \
  --name opengauss \
  -e GS_PASSWORD=Secretpassword@123 \
  -p 5432:5432 \
  -v db-data:/var/lib/opengauss \
  enmotech/opengauss-lite:latest
```

或使用 Docker Compose（启动 Web + DB）：

```
docker-compose up --build -d
```


### 4. 启动开发环境

```
npm run dev
```

看到输出：

```
Server running at http://localhost:3000
```

浏览器访问即可。


---
