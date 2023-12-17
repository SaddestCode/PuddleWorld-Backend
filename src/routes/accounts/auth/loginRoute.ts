import { FastifyInstance } from 'fastify';
import { LoginRequestModel } from '@/models/accounts/auth/loginRequestModel';
import { API_ROUTES } from '@/apiRoutes';
import { loginUser } from '@/services/accounts/auth/loginService';

const loginRoute = async (app: FastifyInstance) => {

  app.post(API_ROUTES.USER_LOGIN, async (request, reply) => {
    try {
      const loginInfo = request.body as LoginRequestModel;
      const responseMessage = await loginUser(loginInfo);
      reply.status(responseMessage.data ? 201 : 400).send({ message: responseMessage });
    } catch (error) {
      console.error('Failed to handle user login...', error);
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

export default loginRoute;
