import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(configService: ConfigService) {
        console.log(configService.get('FACEBOOK_APP_ID'));
        console.log(configService.get('FACEBOOK_APP_SECRET'));
        console.log(configService.get('FACEBOOK_CALLBACK_URL'));
        super({
            clientID: configService.get('FACEBOOK_APP_ID'),
            clientSecret: configService.get('FACEBOOK_APP_SECRET'),
            callbackURL: configService.get('FACEBOOK_CALLBACK_URL') || 'http://localhost:3000/api/auth/facebook/callback',
            scope: ['email'],
            profileFields: ['emails', 'name', 'photos'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (err: any, user: any, info?: any) => void,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails?.[0]?.value,
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            picture: photos?.[0]?.value,
            facebookId: profile.id,
        };
        done(null, user);
    }
}
