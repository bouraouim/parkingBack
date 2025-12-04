const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parking Payment Machine API',
      version: '1.0.0',
      description: 'Backend API for Parking Payment Machine Assistant mobile application',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            }
          }
        },
        Mission: {
          type: 'object',
          properties: {
            missionId: {
              type: 'string',
              description: 'Unique mission identifier'
            },
            payload: {
              type: 'object',
              properties: {
                date: { type: 'string', example: '2025-11-26' },
                cashier: { type: 'string', example: 'John Doe' },
                machineName: { type: 'string', example: 'Machine A1' },
                collect: {
                  type: 'object',
                  properties: {
                    noteAmount: { type: 'number', example: 500 },
                    coinAmount: { type: 'number', example: 200 }
                  }
                },
                refill: {
                  type: 'object',
                  properties: {
                    coins: {
                      type: 'object',
                      properties: {
                        amount: { type: 'number', example: 100 },
                        coinTypes: { type: 'object', example: { '1': 50, '2': 50 } }
                      }
                    },
                    notes: {
                      type: 'object',
                      properties: {
                        amount: { type: 'number', example: 500 },
                        noteTypes: { type: 'object', example: { '10': 30, '20': 20 } }
                      }
                    }
                  }
                },
                maintenance: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['task'],
                    properties: {
                      task: {
                        type: 'object',
                        required: ['en', 'fr'],
                        properties: {
                          en: { type: 'string', example: 'Clean screen' },
                          fr: { type: 'string', example: 'Nettoyer l\'écran' }
                        }
                      },
                      completed: {
                        type: 'boolean',
                        default: false,
                        example: false
                      }
                    }
                  },
                  example: [
                    { task: { en: 'Clean screen', fr: 'Nettoyer l\'écran' }, completed: false },
                    { task: { en: 'Check printer', fr: 'Vérifier l\'imprimante' }, completed: false }
                  ]
                },
                qrCode: { type: 'string', example: 'QR12345' }
              }
            },
            status: {
              type: 'string',
              enum: ['unopened', 'in_progress', 'completed'],
              description: 'Mission status'
            },
            openedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When mission was opened'
            },
            openedBy: {
              type: 'string',
              description: 'User ID who opened the mission'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When mission was completed'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Missions',
        description: 'Mission management endpoints'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
