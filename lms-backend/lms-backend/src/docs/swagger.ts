import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS API - Escola de Governo',
      version: '1.0.0',
      description: 'Documentação da API do Sistema de Gestão de Aprendizagem (LMS)',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor Local',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/src/routes/*.ts'], // Caminhos onde o Swagger vai procurar os comentários
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};