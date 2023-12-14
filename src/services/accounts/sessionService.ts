import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export async function createUserSession(accountId: number, browserInfo: string): Promise<string> {
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