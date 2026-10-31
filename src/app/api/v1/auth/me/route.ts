import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }
  return successResponse({ user });
}
