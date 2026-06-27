// PM2 生态系统配置
// 用法: pm2 start scripts/pm2-ecosystem.config.cjs
//       pm2 save                # 保存进程列表
//       pm2 startup             # 开机自启（可选）
//       pm2 status              # 查看状态
//       pm2 logs bridge          # 查看日志

module.exports = {
  apps: [
    {
      name: 'bridge',
      script: 'auto-processor.cjs',
      cwd: __dirname + '/../bridge',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
      // 日志配置
      error_file: __dirname + '/../logs/bridge-error.log',
      out_file: __dirname + '/../logs/bridge-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
