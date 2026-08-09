/**
 * PM2 配置：飞书 Bridge 保活
 * 启动: pm2 start ecosystem.config.js && pm2 save
 * 开机自启: pm2 startup（按提示执行）
 */
module.exports = {
  apps: [
    {
      name: 'growth-bridge',
      script: 'bridge/auto-processor.cjs',
      cwd: __dirname,
      env: {
        PATH: process.env.PATH + ':/Users/hw7/Library/Application Support/namiai/mcp/Node/bin',
      },
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '200M',
      out_file: '/tmp/growth-bridge-out.log',
      error_file: '/tmp/growth-bridge-err.log',
      time: true,
    },
  ],
};
