import { Test, TestingModule } from '@nestjs/testing';
import { AgentsService } from './agents.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AgentsService', () => {
    let service: AgentsService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        agent: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AgentsService>(AgentsService);
        prismaService = module.get<PrismaService>(PrismaService);
        expect(prismaService).toBeDefined();
    });

    // To silence unused variable warning if not used in tests yet
    // afterEach(() => {
    //    expect(prismaService).toBeDefined();
    // });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new agent', async () => {
            const userId = 'user123';
            const createInput = {
                name: 'Test Agent',
                domain: 'test',
                description: 'A test agent',
                isPublic: true,
            };

            const mockAgent = {
                id: 'agent123',
                ...createInput,
                trainerId: userId,
                trainer: { id: userId },
            };

            mockPrismaService.agent.create.mockResolvedValue(mockAgent);

            const result = await service.create(userId, createInput);

            expect(result).toEqual(mockAgent);
            expect(mockPrismaService.agent.create).toHaveBeenCalledWith({
                data: {
                    ...createInput,
                    trainerId: userId,
                },
                include: {
                    trainer: true,
                },
            });
        });
    });

    describe('findAll', () => {
        it('should return all public agents when isPublic is true', async () => {
            const mockAgents = [
                { id: '1', name: 'Agent 1', isPublic: true },
                { id: '2', name: 'Agent 2', isPublic: true },
            ];

            mockPrismaService.agent.findMany.mockResolvedValue(mockAgents);

            const result = await service.findAll(true);

            expect(result).toEqual(mockAgents);
            expect(mockPrismaService.agent.findMany).toHaveBeenCalledWith({
                where: { isPublic: true },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should return all agents when isPublic is undefined', async () => {
            const mockAgents = [
                { id: '1', name: 'Agent 1', isPublic: true },
                { id: '2', name: 'Agent 2', isPublic: false },
            ];

            mockPrismaService.agent.findMany.mockResolvedValue(mockAgents);

            const result = await service.findAll();

            expect(result).toEqual(mockAgents);
            expect(mockPrismaService.agent.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('findOne', () => {
        it('should return an agent by id', async () => {
            const mockAgent = {
                id: 'agent123',
                name: 'Test Agent',
            };

            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);

            const result = await service.findOne('agent123');

            expect(result).toEqual(mockAgent);
        });

        it('should throw NotFoundException if agent not found', async () => {
            mockPrismaService.agent.findUnique.mockResolvedValue(null);

            await expect(service.findOne('nonexistent')).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('update', () => {
        it('should update agent if user is owner', async () => {
            const agentId = 'agent123';
            const userId = 'user123';
            const updateInput = { name: 'Updated Agent' };

            const mockAgent = {
                id: agentId,
                trainerId: userId,
                name: 'Old Name',
            };

            const updatedAgent = {
                ...mockAgent,
                ...updateInput,
            };

            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
            mockPrismaService.agent.update.mockResolvedValue(updatedAgent);

            const result = await service.update(agentId, userId, updateInput);

            expect(result).toEqual(updatedAgent);
        });

        it('should throw ForbiddenException if user is not owner', async () => {
            const agentId = 'agent123';
            const userId = 'user123';
            const wrongUserId = 'user456';
            const updateInput = { name: 'Updated Agent' };

            const mockAgent = {
                id: agentId,
                trainerId: userId,
                name: 'Old Name',
            };

            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);

            await expect(
                service.update(agentId, wrongUserId, updateInput)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('delete', () => {
        it('should delete agent if user is owner', async () => {
            const agentId = 'agent123';
            const userId = 'user123';

            const mockAgent = {
                id: agentId,
                trainerId: userId,
            };

            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
            mockPrismaService.agent.delete.mockResolvedValue(mockAgent);

            const result = await service.delete(agentId, userId);

            expect(result).toBe(true);
            expect(mockPrismaService.agent.delete).toHaveBeenCalledWith({
                where: { id: agentId },
            });
        });

        it('should throw ForbiddenException if user is not owner', async () => {
            const agentId = 'agent123';
            const userId = 'user123';
            const wrongUserId = 'user456';

            const mockAgent = {
                id: agentId,
                trainerId: userId,
            };

            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);

            await expect(service.delete(agentId, wrongUserId)).rejects.toThrow(
                ForbiddenException
            );
        });
    });

    describe('searchByDomain', () => {
        it('should return agents matching domain', async () => {
            const domain = 'agriculture';
            const mockAgents = [
                { id: '1', name: 'Farm Agent', domain: 'agriculture', isPublic: true },
                { id: '2', name: 'Crop Agent', domain: 'agriculture', isPublic: true },
            ];

            mockPrismaService.agent.findMany.mockResolvedValue(mockAgents);

            const result = await service.searchByDomain(domain);

            expect(result).toEqual(mockAgents);
            expect(mockPrismaService.agent.findMany).toHaveBeenCalledWith({
                where: {
                    domain: {
                        contains: domain,
                        mode: 'insensitive',
                    },
                    isPublic: true,
                },
                include: {
                    trainer: true,
                },
            });
        });
    });
});
