const { createClient } = require('redis');

const redisClient = createClient({
  username: 'default',
  password: process.env.REDIS_PASS, // make sure env is correct
  socket: {
    host: 'redis-12133.crce217.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 12133
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

module.exports = redisClient;
