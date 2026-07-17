// const { createClient } = require('redis');

// const redisClient = createClient({
//   username: 'default',
//   password: process.env.REDIS_PASS,
//   socket: {
//     host: 'redis-17236.crce281.ap-south-1-3.ec2.cloud.redislabs.com',
//     port: 17236
//   }
// });

// redisClient.on('error', (err) => {
//   console.error('Redis Client Error:', err);
// });

// module.exports = redisClient;