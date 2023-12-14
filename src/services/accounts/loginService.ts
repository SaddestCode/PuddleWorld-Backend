import { PrismaClient } from '@prisma/client';
import { ResponseMessage } from '@/models/responseMessage';
import { LoginRequestModel } from '@/models/loginRequestModel';
import { UserLoginDetail } from '@/models/userLoginDetail';
import { createUserSession } from './sessionService';

const bcrypt = require('bcrypt')
const prisma = new PrismaClient();

function isValidFields(loginInfo: LoginRequestModel) {
  const isUsernameValid = loginInfo.username.length >= 3;
  const isPasswordValid = loginInfo.plainPassword.length >= 8;

  return isUsernameValid && isPasswordValid;
}

async function findUser(username: string) {
  const existingUser = await prisma.account.findUnique({
    where: { username: username },
  });

  return existingUser;
}

export const loginUser = async (loginInfo: LoginRequestModel): Promise<ResponseMessage> => {
  if (!isValidFields(loginInfo)) {
    return {
      title: 'INVALID BODY',
      message: 'Username not found!',
      data: null,
    };
  }
  
  try {

    const user = await findUser(loginInfo.username);
    if (!user) {
      return {
        title: 'USERNAME NOT FOUND',
        message: 'Username not found!',
        data: null,
      };
    }

    const passwordMatches = await bcrypt.compare(loginInfo.plainPassword, user.hashedPassword);
    if (!passwordMatches) {
      return {
        title: 'INCORRECT PASSWORD',
        message: 'Incorrect password!',
        data: null,
      };
    }

    const sessionToken = await createUserSession(user.id, loginInfo.browserInfo);

    const userLoginDetail: UserLoginDetail = {
        token: sessionToken,
        username: user.username,
        displayName: user.displayName
    };

    return {
      title: 'LOGIN SUCCESSFUL',
      message: 'Login successful!',
      data: userLoginDetail,
    };

  } catch (error) {
    console.error('Failed to handle user login...', error);
    return {
      title: 'SERVER ERROR',
      message: 'Internal server error occurred! Try again or contact admin!',
      data: null,
    };
  }
};
