@echo off
REM AI Insights 插件本地安装脚本 (Windows)

setlocal enabledelayedexpansion

echo ========================================
echo   AI Insights 插件安装脚本
echo ========================================
echo.

REM 获取项目根目录
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

REM 定义安装路径
set "PLUGIN_NAME=ai-insights"
set "INSTALL_DIR=%USERPROFILE%\.claude\plugins\local\%PLUGIN_NAME%"

REM 创建安装目录
echo [1/3] 创建安装目录...
if not exist "%USERPROFILE%\.claude\plugins\local" mkdir "%USERPROFILE%\.claude\plugins\local"
if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%"
mkdir "%INSTALL_DIR%"

REM 复制插件文件
echo [2/3] 复制插件文件...
xcopy /E /I /Y "%PROJECT_ROOT%\packages\ai-insights\*" "%INSTALL_DIR%"

REM 确保 .claude-plugin 目录存在
if not exist "%INSTALL_DIR%\.claude-plugin" mkdir "%INSTALL_DIR%\.claude-plugin"
copy /Y "%PROJECT_ROOT%\packages\ai-insights\.claude-plugin\plugin.json" "%INSTALL_DIR%\.claude-plugin\"

echo.
echo ========================================
echo   ✅ 插件安装完成！
echo ========================================
echo.
echo 安装位置: %INSTALL_DIR%
echo.
echo 下一步:
echo   1. 重启 Claude Code
echo   2. 测试命令: /perf-status 或 /perf-report
echo.
pause
