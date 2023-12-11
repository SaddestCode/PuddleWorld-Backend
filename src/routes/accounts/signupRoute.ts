import { FastifyInstance } from 'fastify';
import { SignupRequestModel } from '@/models/signupRequestModel';
import { signupUser } from '@/services/accounts/signupService';

const signupRoute = async (app: FastifyInstance) => {

  app.post('/user/signup', async (request, reply) => {
    try {
      const signupInfo = request.body as SignupRequestModel;
      const responseMessage = await signupUser(signupInfo);
      reply.status(responseMessage.data ? 201 : 400).send({ message: responseMessage });
    } catch (error) {
      console.error('Failed to handle user signup...', error);
      reply.status(500).send({
        message: {
          title: 'SERVER ERROR',
          message: 'Internal server error occurred.',
          data: null,
        },
      });
    }
  });

};

export default signupRoute;
