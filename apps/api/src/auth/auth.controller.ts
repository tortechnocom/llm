import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    private readonly frontendUrl: string;

    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {
        this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
    }

    // Google OAuth
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {
        // Guard redirects to Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: any, @Res() res: any) {
        const { token } = await this.authService.validateSocialUser(req.user);
        res.redirect(`${this.frontendUrl}/login?token=${token}`);
    }

    // Facebook OAuth
    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    facebookLogin() {
        // Guard redirects to Facebook
    }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookCallback(@Req() req: any, @Res() res: any) {
        const { token } = await this.authService.validateSocialUser(req.user);
        res.redirect(`${this.frontendUrl}/login?token=${token}`);
    }
}
