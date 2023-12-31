import { PrismaClient } from '@prisma/client';
import { SignupRequestModel } from '@/models/accounts/auth/signupRequestModel';
import { ResponseMessage } from '@/models/accounts/auth/responseMessage';
import { createUserSession } from '../sessionService';
import { UserLoginDetail } from '@/models/accounts/auth/userLoginDetail';

const bcrypt = require('bcrypt')
const prisma = new PrismaClient();
const saltRounds = 10;

function isValidFields(signupInfo: SignupRequestModel) {
  const isUsernameValid = signupInfo.username.length >= 3;
  const isPasswordValid = signupInfo.plainPassword.length >= 8;

  return isUsernameValid && isPasswordValid;
}

async function usernameExists(username: string) {
  const existingUser = await prisma.account.findUnique({
    where: { username: username },
  });

  return existingUser != null;
}

async function createUser(signupInfo: SignupRequestModel) {
  const hashedPassword = await bcrypt.hash(signupInfo.plainPassword, saltRounds);
  const newUser = await prisma.account.create({
    data: {
      username: signupInfo.username,
      displayName: signupInfo.username,
      hashedPassword: hashedPassword,
    },
  });

  return newUser;
}

export const signupUser = async (signupInfo: SignupRequestModel): Promise<ResponseMessage> => {
  if (!isValidFields(signupInfo)) {
    return {
      title: 'INVALID BODY',
      message: 'Password and Username do not match the requirements!',
      data: null,
    };
  }
  
  try {

    if (await usernameExists(signupInfo.username)) {
      return {
        title: 'USERNAME EXISTS',
        message: 'The username is already taken!',
        data: null,
      };
    }

    const newUser = await createUser(signupInfo);
    const newSession = await createUserSession(newUser.id, signupInfo.browserInfo);

    const authData: UserLoginDetail = {
      token: newSession,
      username: newUser.username,
      displayName: newUser.displayName
    }

    return {
      title: 'SUCCESS',
      message: 'User signed up successfully!',
      data: authData,
    };

  } catch (error) {
    console.error('Failed to handle user signup...', error);
    return {
      title: 'SERVER ERROR',
      message: 'Internal server error occurred! Try again or contact admin!',
      data: null,
    };
  }
};
