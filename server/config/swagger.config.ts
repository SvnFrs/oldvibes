import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import type { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Old Vibes API",
      version: "1.0.0",
      description:
        "A platform for sharing and discovering old vibes - connecting buyers and sellers of secondhand items",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in format: Bearer <token>",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "HTTP-only cookie authentication",
        },
      },
    },
  },
  apis: ["./routes/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Old Vibes API Documentation",
      swaggerOptions: {
        securityDefinitions: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    }),
  );
  console.log("📚 Swagger UI available at /api-docs");
};
