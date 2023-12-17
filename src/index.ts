import fastify from 'fastify';
const rateLimit = require('@fastify/rate-limit');
import signupRoute from '@/routes/accounts/auth/signupRoute';
import loginRoute from '@/routes/accounts/auth/loginRoute';

const app = fastify();

app.register(rateLimit, {
  max: 100,
  timeWindow: 60000,
  cache: 10000,
});

signupRoute(app);
loginRoute(app);

app.get('/test', async (request, reply) => { 
  reply.status(200).send("Works!");
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    console.log(err)
    process.exit(1);
  }
};

start();
