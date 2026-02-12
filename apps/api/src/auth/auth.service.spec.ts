import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);

        expect(prismaService).toBeDefined();
        expect(jwtService).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should create a new user and return token', async () => {
            const registerInput = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };

            const mockUser = {
                id: '123',
                email: registerInput.email,
                password: 'hashed_password',
                firstName: registerInput.firstName,
                lastName: registerInput.lastName,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('mock_token');

            const result = await service.register(registerInput);

            expect(result).toEqual({
                token: 'mock_token',
                user: mockUser,
            });
            expect(mockPrismaService.user.create).toHaveBeenCalled();
        });

        it('should throw error if user already exists', async () => {
            const registerInput = {
                email: 'test@example.com',
                password: 'password123',
            };

            mockPrismaService.user.findUnique.mockResolvedValue({ id: '123' });

            await expect(service.register(registerInput)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('login', () => {
        it('should return token for valid credentials', async () => {
            const loginInput = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockUser = {
                id: '123',
                email: loginInput.email,
                password: await bcrypt.hash(loginInput.password, 10),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('mock_token');

            const result = await service.login(loginInput);

            expect(result).toEqual({
                token: 'mock_token',
                user: mockUser,
            });
        });

        it('should throw error for invalid email', async () => {
            const loginInput = {
                email: 'wrong@example.com',
                password: 'password123',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.login(loginInput)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should throw error for invalid password', async () => {
            const loginInput = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            const mockUser = {
                id: '123',
                email: loginInput.email,
                password: await bcrypt.hash('correctpassword', 10),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            await expect(service.login(loginInput)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('validateUser', () => {
        it('should return user if found', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.validateUser('123');

            expect(result).toEqual(mockUser);
        });

        it('should throw error if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.validateUser('123')).rejects.toThrow(
                UnauthorizedException
            );
        });
    });
});
