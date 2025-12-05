#!/usr/bin/env pwsh
# OpenGauss Web 应用 - 一键启动脚本

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "OpenGauss Web 应用 - 启动脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker
Write-Host "[1/4] 检查 Docker..." -ForegroundColor Yellow
$dockerCheck = docker --version 2>&1
if ($?) {
    Write-Host "✓ Docker 已安装: $dockerCheck" -ForegroundColor Green
} else {
    Write-Host "✗ Docker 未安装或未运行" -ForegroundColor Red
    Write-Host "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 检查 Node.js
Write-Host "[2/4] 检查 Node.js..." -ForegroundColor Yellow
$nodeCheck = node --version 2>&1
if ($?) {
    Write-Host "✓ Node.js 已安装: $nodeCheck" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js 未安装" -ForegroundColor Red
    exit 1
}

# 启动 openGauss
Write-Host "[3/4] 启动 openGauss 数据库..." -ForegroundColor Yellow
$ogStatus = docker ps --filter "name=opengauss" --quiet
if ($ogStatus) {
    Write-Host "✓ openGauss 已在运行" -ForegroundColor Green
} else {
    Write-Host "正在启动 openGauss..." -ForegroundColor Cyan
    docker run -d `
      --name opengauss `
      -e GS_PASSWORD=Secretpassword@123 `
      -p 5432:5432 `
      -v db-data:/var/lib/opengauss `
      enmotech/opengauss-lite:latest > $null 2>&1
    
    if ($?) {
        Write-Host "✓ openGauss 已启动" -ForegroundColor Green
        Write-Host "   等待 5 秒让数据库初始化..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
    } else {
        Write-Host "✗ 启动 openGauss 失败" -ForegroundColor Red
        exit 1
    }
}

# 启动 Web 应用
Write-Host "[4/4] 启动 Web 应用..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✓ 所有服务已启动！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Web 应用地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️  数据库连接: localhost:5432 (gaussdb/Secretpassword@123)" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止应用" -ForegroundColor Yellow
Write-Host ""

npm run dev
