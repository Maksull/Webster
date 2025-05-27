import { API_URL } from '@/config';
import { Template } from '@/types/template';

class TemplateService {
    async getUserTemplates(token: string): Promise<Template[]> {
        console.log('Fetching user templates from:', `${API_URL}/templates`);
        const response = await fetch(`${API_URL}/templates`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch templates');
        }

        const data = await response.json();
        return data.data.templates;
    }

    async getTemplate(id: string, token: string): Promise<Template> {
        const response = await fetch(`${API_URL}/templates/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch template');
        }

        const data = await response.json();
        return data.data.template;
    }

    async createTemplateFromCanvas(
        canvasId: string,
        templateData: { name: string; description?: string },
        token: string,
    ): Promise<Template> {
        const response = await fetch(
            `${API_URL}/templates/from-canvas/${canvasId}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(templateData),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to create template');
        }

        const data = await response.json();
        return data.data.template;
    }

    async createCanvasFromTemplate(
        templateId: string,
        canvasData: { name: string; description?: string },
        token: string,
    ): Promise<any> {
        const response = await fetch(
            `${API_URL}/templates/${templateId}/create-canvas`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(canvasData),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to create canvas from template');
        }

        const data = await response.json();
        return data.data.canvas;
    }

    async deleteTemplate(id: string, token: string): Promise<void> {
        const response = await fetch(`${API_URL}/templates/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete template');
        }
    }
}

export const templateService = new TemplateService();
