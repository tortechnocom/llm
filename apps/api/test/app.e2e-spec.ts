import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API Integration Tests (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let authToken: string;
    let userId: string;
    let agentId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    describe('Authentication Flow', () => {
        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: `
            mutation {
              register(input: {
                email: "test@example.com"
                password: "password123"
                firstName: "Test"
                lastName: "User"
              }) {
                token
                user {
                  id
                  email
                  firstName
                }
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.register.token).toBeDefined();
                    expect(res.body.data.register.user.email).toBe('test@example.com');
                    authToken = res.body.data.register.token;
                    userId = res.body.data.register.user.id;
                });
        });

        it('should login with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: `
            mutation {
              login(input: {
                email: "test@example.com"
                password: "password123"
              }) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.login.token).toBeDefined();
                });
        });

        it('should get current user with valid token', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            query {
              me {
                id
                email
                firstName
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.me.email).toBe('test@example.com');
                });
        });

        it('should reject request without token', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: `
            query {
              me {
                id
                email
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.errors).toBeDefined();
                });
        });
    });

    describe('Agent Management Flow', () => {
        it('should create a new agent', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            mutation {
              createAgent(input: {
                name: "Test Agent"
                domain: "test"
                description: "A test agent for integration testing"
                systemPrompt: "You are a helpful test assistant"
                tokenPriceMultiplier: 1.5
                isPublic: true
              }) {
                id
                name
                domain
                isPublic
                trainer {
                  id
                }
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.createAgent.name).toBe('Test Agent');
                    expect(res.body.data.createAgent.trainer.id).toBe(userId);
                    agentId = res.body.data.createAgent.id;
                });
        });

        it('should list all public agents', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: `
            query {
              agents(isPublic: true) {
                id
                name
                domain
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.agents)).toBe(true);
                    expect(res.body.data.agents.length).toBeGreaterThan(0);
                });
        });

        it('should get agent by id', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: `
            query {
              agent(id: "${agentId}") {
                id
                name
                domain
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.agent.id).toBe(agentId);
                    expect(res.body.data.agent.name).toBe('Test Agent');
                });
        });

        it('should update own agent', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            mutation {
              updateAgent(
                id: "${agentId}"
                input: {
                  name: "Updated Test Agent"
                }
              ) {
                id
                name
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.updateAgent.name).toBe('Updated Test Agent');
                });
        });

        it('should get my agents', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            query {
              myAgents {
                id
                name
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.myAgents)).toBe(true);
                    expect(res.body.data.myAgents.length).toBeGreaterThan(0);
                });
        });
    });

    describe('Knowledge Base Flow', () => {
        it('should add knowledge to agent', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            mutation {
              createKnowledge(input: {
                agentId: "${agentId}"
                title: "Test Knowledge"
                content: "This is test content for the knowledge base"
                tags: ["test", "integration"]
              }) {
                id
                title
                content
                tags
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.createKnowledge.title).toBe('Test Knowledge');
                    expect(res.body.data.createKnowledge.tags).toContain('test');
                });
        });

        it('should get knowledge by agent', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: `
            query {
              knowledgeByAgent(agentId: "${agentId}") {
                id
                title
                content
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.knowledgeByAgent)).toBe(true);
                });
        });
    });

    describe('Chat Flow', () => {
        let sessionId: string;

        it('should create a chat session', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            mutation {
              createChatSession(input: {
                agentId: "${agentId}"
                title: "Test Chat"
              }) {
                id
                agentId
                title
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.createChatSession.agentId).toBe(agentId);
                    sessionId = res.body.data.createChatSession.id;
                });
        });

        it('should get my chat sessions', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            query {
              myChatSessions {
                id
                title
                agentId
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.myChatSessions)).toBe(true);
                    expect(res.body.data.myChatSessions.length).toBeGreaterThan(0);
                });
        });
    });

    describe('Token Transactions Flow', () => {
        it('should get my stats', () => {
            return request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: `
            query {
              myStats {
                totalSpent
                totalEarned
                netBalance
                totalTransactions
              }
            }
          `,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.myStats).toBeDefined();
                    expect(typeof res.body.data.myStats.totalSpent).toBe('number');
                });
        });
    });
});
