'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Switch } from '@heroui/react';
import { ArrowLeft, Plus, Trash2, Edit2, FileText, Upload, Settings } from 'lucide-react';
import Link from 'next/link';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function AgentManagementPage() {
    const params = useParams();
    const router = useRouter();
    const [agent, setAgent] = useState<any>(null);
    const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentKbItem, setCurrentKbItem] = useState<any>(null);

    // Agent Edit State
    const { isOpen: isAgentModalOpen, onOpen: onOpenAgentModal, onClose: onCloseAgentModal, onOpenChange: onAgentModalChange } = useDisclosure();
    const [agentFormData, setAgentFormData] = useState({
        name: '',
        description: '',
        systemPrompt: '',
        domain: '',
        isPublic: false
    });

    // KB Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
    });

    useEffect(() => {
        if (params.id) {
            fetchAgentData();
        }
    }, [params.id]);

    const fetchAgentData = async () => {
        try {
            const token = localStorage.getItem('token');
            const agentId = params.id;

            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: `
                        query GetAgentData($id: String!) {
                            agent(id: $id) {
                                id
                                name
                                description
                                domain
                                isPublic
                                systemPrompt
                            }
                            knowledgeByAgent(agentId: $id) {
                                id
                                title
                                content
                                tags
                                createdAt
                            }
                        }
                    `,
                    variables: { id: agentId },
                }),
            });

            const { data } = await response.json();
            if (data) {
                setAgent(data.agent);
                setKnowledgeBase(data.knowledgeByAgent || []);
            }
        } catch (error) {
            console.error('Error fetching agent data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData({ title: '', content: '', tags: '' });
        setCurrentKbItem(null);
        onOpen();
    };

    const handleOpenEdit = (item: any) => {
        setModalMode('edit');
        setFormData({
            title: item.title || '',
            content: item.content || '',
            tags: item.tags ? item.tags.join(', ') : '',
        });
        setCurrentKbItem(item);
        onOpen();
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

            let query = '';
            let variables = {};

            if (modalMode === 'create') {
                query = `
                    mutation CreateKnowledge($input: CreateKnowledgeInput!) {
                        createKnowledge(input: $input) {
                            id
                        }
                    }
                `;
                variables = {
                    input: {
                        agentId: agent.id,
                        title: formData.title,
                        content: formData.content,
                        tags: tagsArray
                    }
                };
            } else {
                query = `
                    mutation UpdateKnowledge($input: UpdateKnowledgeInput!) {
                        updateKnowledge(input: $input) {
                            id
                        }
                    }
                `;
                variables = {
                    input: {
                        id: currentKbItem.id,
                        title: formData.title,
                        content: formData.content,
                        tags: tagsArray
                    }
                };
            }

            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query, variables }),
            });

            const result = await response.json();
            if (result.data) {
                await fetchAgentData(); // Refresh list
                onClose(); // Close modal
            }

            if (result.errors) {
                console.error('Error saving knowledge:', result.errors);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleOpenEditAgent = () => {
        setAgentFormData({
            name: agent.name,
            description: agent.description || '',
            systemPrompt: agent.systemPrompt || '',
            domain: agent.domain || '',
            isPublic: agent.isPublic
        });
        onOpenAgentModal();
    };

    const handleUpdateAgent = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: `
                        mutation UpdateAgent($id: String!, $input: UpdateAgentInput!) {
                            updateAgent(id: $id, input: $input) {
                                id
                            }
                        }
                    `,
                    variables: {
                        id: agent.id,
                        input: {
                            name: agentFormData.name,
                            description: agentFormData.description,
                            systemPrompt: agentFormData.systemPrompt,
                            domain: agentFormData.domain,
                            isPublic: agentFormData.isPublic
                        }
                    },
                }),
            });

            const result = await response.json();
            if (result.data) {
                await fetchAgentData();
                onCloseAgentModal();
            } else {
                console.error('Error updating agent:', result.errors);
            }
        } catch (error) {
            console.error('Error updating agent:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this knowledge item?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: `
                        mutation DeleteKnowledge($id: String!) {
                            deleteKnowledge(id: $id)
                        }
                    `,
                    variables: { id },
                }),
            });

            const result = await response.json();
            if (result.data?.deleteKnowledge) {
                fetchAgentData(); // Refresh list
            }
        } catch (error) {
            console.error('Error deleting knowledge:', error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!agent) return <div className="p-8 text-center">Agent not found</div>;



    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <Button
                        as={Link}
                        href="/dashboard"
                        variant="light"
                        startContent={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back to Dashboard
                    </Button>
                    <ThemeSwitcher />
                </div>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                        <p className="text-gray-400 max-w-2xl">{agent.description}</p>
                        <div className="flex gap-2 mt-4">
                            <Chip size="sm" color={agent.isPublic ? "success" : "default"}>
                                {agent.isPublic ? "Public" : "Private"}
                            </Chip>
                            {agent.domain && <Chip size="sm" variant="flat">{agent.domain}</Chip>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="flat"
                            startContent={<Settings className="w-4 h-4" />}
                            onPress={handleOpenEditAgent}
                        >
                            Edit Agent
                        </Button>
                        <Button
                            as={Link}
                            href={`/chat?agentId=${agent.id}`}
                            color="primary"
                        >
                            Chat with Agent
                        </Button>
                    </div>
                </div>

                <Card className="mb-8">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Knowledge Base
                        </h2>
                        <Button
                            color="primary"
                            startContent={<Plus className="w-4 h-4" />}
                            onPress={handleOpenCreate}
                        >
                            Add Knowledge
                        </Button>
                    </CardHeader>
                    <CardBody>
                        {knowledgeBase.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No knowledge base documents yet.</p>
                                <p className="text-sm">Add documents to help your agent answer questions.</p>
                            </div>
                        ) : (
                            <Table aria-label="Knowledge Base Table">
                                <TableHeader>
                                    <TableColumn>TITLE</TableColumn>
                                    <TableColumn>TAGS</TableColumn>
                                    <TableColumn>CREATED</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {knowledgeBase.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.title || 'Untitled'}</p>
                                                    <p className="text-tiny text-gray-400 truncate max-w-xs">{item.content.substring(0, 50)}...</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.tags?.map((tag: string, i: number) => (
                                                        <Chip key={i} size="sm" variant="flat">{tag}</Chip>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => handleOpenEdit(item)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="danger"
                                                        variant="light"
                                                        onPress={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {modalMode === 'create' ? 'Add Knowledge' : 'Edit Knowledge'}
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Title"
                                    placeholder="Enter document title"
                                    value={formData.title}
                                    onValueChange={(val) => setFormData({ ...formData, title: val })}
                                />
                                <Textarea
                                    label="Content"
                                    placeholder="Enter knowledge content here..."
                                    minRows={8}
                                    value={formData.content}
                                    onValueChange={(val) => setFormData({ ...formData, content: val })}
                                />
                                <Input
                                    label="Tags (comma separated)"
                                    placeholder="e.g. farming, irrigation, crops"
                                    value={formData.tags}
                                    onValueChange={(val) => setFormData({ ...formData, tags: val })}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleSubmit}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Agent Modal */}
            <Modal isOpen={isAgentModalOpen} onOpenChange={onAgentModalChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Edit Agent Details</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Name"
                                        placeholder="Agent Name"
                                        value={agentFormData.name}
                                        onValueChange={(val) => setAgentFormData({ ...agentFormData, name: val })}
                                    />
                                    <Input
                                        label="Domain"
                                        placeholder="e.g. Finance, Agriculture"
                                        value={agentFormData.domain}
                                        onValueChange={(val) => setAgentFormData({ ...agentFormData, domain: val })}
                                    />
                                </div>
                                <Textarea
                                    label="Description"
                                    placeholder="Short description of your agent"
                                    value={agentFormData.description}
                                    onValueChange={(val) => setAgentFormData({ ...agentFormData, description: val })}
                                />
                                <Textarea
                                    label="System Prompt"
                                    placeholder="Instructions for the AI..."
                                    minRows={4}
                                    value={agentFormData.systemPrompt}
                                    onValueChange={(val) => setAgentFormData({ ...agentFormData, systemPrompt: val })}
                                />
                                <div className="flex items-center justify-between p-4 rounded-lg border border-default-200">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-medium font-medium">Public Visibility</span>
                                        <span className="text-tiny text-default-500">
                                            Allow other users to chat with this agent
                                        </span>
                                    </div>
                                    <Switch
                                        isSelected={agentFormData.isPublic}
                                        color="success"
                                        onValueChange={(val) => setAgentFormData({ ...agentFormData, isPublic: val })}
                                    >
                                        {agentFormData.isPublic ? 'Public' : 'Private'}
                                    </Switch>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleUpdateAgent}>
                                    Update Agent
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
