const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Invom AI Backend API',
      version: '1.0.0',
      description: 'API documentation for Invom AI backend',
    },
    servers: [
      {
        url: 'http://localhost:3001', // This should match your backend port!
      },
    ],
  },
  apis: ['./src/api/**/*.js'], // Path to the API docs (adjust as needed)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 