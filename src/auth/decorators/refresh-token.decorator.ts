import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

export const RefreshToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithCookies>();
    return request.cookies.refreshToken ?? '';
  },
);
