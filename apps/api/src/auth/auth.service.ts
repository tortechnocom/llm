import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth.response';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(input: RegisterInput): Promise<AuthResponse> {
        const { email, password, firstName, lastName } = input;

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
        });

        // Generate JWT
        const token = this.generateToken(user.id);

        return {
            token,
            user,
        };
    }

    async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT
        const token = this.generateToken(user.id);

        return {
            token,
            user,
        };
    }



    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    private generateToken(userId: string): string {
        return this.jwtService.sign({ sub: userId });
    }

    async validateSocialUser(profile: any): Promise<AuthResponse> {
        const { email, firstName, lastName, googleId, facebookId } = profile;

        let user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // Link social ID if not already linked
            const updateData: any = {};
            if (googleId && !user.googleId) updateData.googleId = googleId;
            if (facebookId && !user.facebookId) updateData.facebookId = facebookId;

            if (Object.keys(updateData).length > 0) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: updateData,
                });
            }
        } else {
            // Create new user with a random password
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    googleId: googleId || null,
                    facebookId: facebookId || null,
                },
            });
        }

        const token = this.generateToken(user.id);
        return { token, user };
    }

    async requestDataDeletion(email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            // Clear social login associations immediately
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: null,
                    facebookId: null,
                },
            });
            // In production: queue a full account deletion job with the confirmationCode
        }
    }
}
