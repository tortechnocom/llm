import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
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

    // Facebook Data Deletion Callback
    @Post('data-deletion')
    async dataDeletion(@Body() body: { email?: string; signed_request?: string }) {
        const confirmationCode = `DEL-${Date.now()}`;

        if (body.email) {
            // User-initiated deletion via the frontend form
            await this.authService.requestDataDeletion(body.email, confirmationCode);
        }

        // Facebook sends a signed_request for server-to-server deletion callbacks
        return {
            url: `${this.frontendUrl}/user-data-deletion`,
            confirmation_code: confirmationCode,
            confirmationCode,
        };
    }
}
