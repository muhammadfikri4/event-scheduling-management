module.exports = {
  apps: [
    {
      name: "event-scheduling",
      script: "server.custom.js",
      cwd: "/home/linuxuser/app/event-scheduling-management",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        DATABASE_URL: "postgres://default:BjQhdeHxOy32@ep-fancy-lake-a1foq039.ap-southeast-1.aws.neon.tech:5432/event_scheduling?sslmode=require",
        AUTH_SECRET: "change-this-to-a-random-secret-key-in-production",
        INSECURE_COOKIES: "true",
      },
    },
  ],
};
