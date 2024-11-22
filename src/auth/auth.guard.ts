import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const user = gqlContext['user'];
        const tokenError = gqlContext['tokenError'];
        
        if(tokenError) {
            throw new UnauthorizedException(tokenError);
        }
        
        if(!user) {
            throw new UnauthorizedException("Not authenticated");
        }
        return true;
    }
}