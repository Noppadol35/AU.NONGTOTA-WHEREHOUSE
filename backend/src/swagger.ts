import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AU.NONGTOTA API Documentation",
            version: "1.0.0",
            description:
                "API documentation for AU.NONGTOTA automotive service management system",
            contact: {
                name: "API Support",
                email: "nongtota.mechanic@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "sessionId",
                },
            },
        },
        security: [
            {
                sessionAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/types/*.ts", "./src/swagger-schemas.ts"], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
