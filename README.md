本项目实现：

- 后端使用 Node.js + Express，连接国产数据库 openGauss（兼容 PostgreSQL 协议，也可适配 KingbaseES）。
- 提供任务管理 CRUD API 与简易前端页面。
- 重点展示数据库设计、部署、访问：包含模式定义、初始化与连接配置。
- 使用 Docker 与 docker-compose 一键封装部署（同时启动 openGauss 与 Web 服务）。

---

## 本地运行

1. 安装依赖：

   ```
   npm install
   ```

2. 配置环境：

   复制 `.env.example` 为 `.env` 并按需修改数据库连接配置。

3. **启动 openGauss 数据库**（Docker，需要 Docker Desktop）：

   ```
   docker run -d \
     --name opengauss \
     -e GS_PASSWORD=Secretpassword@123 \
     -p 5432:5432 \
     -v db-data:/var/lib/opengauss \
     enmotech/opengauss-lite:latest
   ```

   或者使用 Docker Compose（包含 Web + DB）：

   ```
   docker-compose up --build -d
   ```

4. 启动开发：

   ```
   npm run dev
   ```

   控制台打印 `Server running at http://localhost:3000` 后，浏览器访问该地址。

---

## Docker 一键部署

确保已安装 Docker Desktop。执行：

```
docker compose up --build -d
```

启动后：

- Web: `http://localhost:3000`
- openGauss：主机 `localhost:5432`，用户 `gaussdb`，密码取自 `docker-compose.yml` 中的 `GS_PASSWORD`
