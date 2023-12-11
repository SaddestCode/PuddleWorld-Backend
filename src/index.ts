import fastify from 'fastify';
import signupRoute from './routes/accounts/signupRoute';

const app = fastify();
signupRoute(app);

app.get('/test', async (request, reply) => { 
  reply.status(200).send("Works!");
});

const start = async () => {
  try {
    await app.listen(3000);
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    console.log(err)
    process.exit(1);
  }
};

start();
