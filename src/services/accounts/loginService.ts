import { PrismaClient } from '@prisma/client';
import { ResponseMessage } from '@/models/responseMessage';
import { LoginRequestModel } from '@/models/loginRequestModel';
import { nanoid } from 'nanoid';
import { UserLoginDetail } from '@/models/userLoginDetail';

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

async function createUserSession(accountId: number, browserInfo: string): Promise<string> {
  const sessionToken = nanoid(); 

  const createdSession = await prisma.accountSession.create({
    data: {
      sessionToken: sessionToken,
      lastUsed: new Date(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      browserInfo: browserInfo,
      accountId: accountId,
    },
  });

  if (createdSession) {
    return sessionToken;
  } else {
    throw new Error('Failed to create user session');
  }
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
