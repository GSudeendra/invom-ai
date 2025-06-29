# Collaborative Learning Document: Broker Connector Project

Welcome! This document is a living knowledge base for all our learnings, best practices, and tips from building the Broker Connector project. It covers both Spring AI and general programmatic/code design wisdom. Feel free to add, edit, or annotate as we learn together!

---

## Table of Contents
1. [MCP (Model Context Protocol) Learnings](#mcp-model-context-protocol-learnings)
2. [Spring AI Learnings](#spring-ai-learnings)
3. [REST API Design & Spring Boot](#rest-api-design--spring-boot)
4. [OpenAPI & Contract-First Approach](#openapi--contract-first-approach)
5. [Code Quality & Clean Code](#code-quality--clean-code)
6. [Validation & Error Handling](#validation--error-handling)
7. [Testing & Debugging](#testing--debugging)
8. [Useful Tools & Resources](#useful-tools--resources)

---

## MCP (Model Context Protocol) Learnings

### What is MCP?
- **MCP (Model Context Protocol)**: A standardized protocol for AI applications to communicate with external data sources and tools.
- **Purpose**: Enables AI models to access real-time data, perform actions, and interact with external systems.
- **Standard**: Developed by OpenAI and other AI companies for consistent AI tool integration.

### Architecture Clarification: What We're Building vs. What Kite Provides

#### What Kite/Zerodha Provides:
- **Kite Connect API**: Official REST API for trading operations
- **Authentication**: Login, session management, 2FA handling
- **Trading Operations**: Place orders, get positions, holdings, etc.
- **Real-time Data**: Market data, order updates, etc.

#### What We're Building:
- **Spring Boot REST API**: Our own API layer that can connect to Kite
- **MCP Client**: Uses Spring AI's MCP client to communicate with MCP servers
- **Business Logic**: Order validation, response formatting, error handling

#### The Missing Piece: MCP Server
- **Current Gap**: We need an MCP server that bridges our app ↔ Kite API
- **Options**:
  1. **Use Existing MCP Server**: If someone has built a Kite MCP server
  2. **Build Our Own MCP Server**: Create a server that implements MCP protocol and calls Kite API
  3. **Direct Kite API Integration**: Skip MCP, use Kite Connect directly

### MCP Server vs. Our Spring Boot App

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Our Spring    │ ◄──────────────► │   MCP Server    │
│   Boot App      │                 │                 │
│                 │                 │                 │
│ - REST API      │                 │ - MCP Protocol  │
│ - Business      │                 │ - Kite API      │
│   Logic         │                 │   Integration   │
│ - Validation    │                 │ - Authentication│
└─────────────────┘                 └─────────────────┘
                                              │
                                              │ HTTP/REST
                                              ▼
                                    ┌─────────────────┐
                                    │   Kite API      │
                                    │ (Zerodha)       │
                                    │                 │
                                    │ - Trading       │
                                    │ - Market Data   │
                                    │ - Account Info  │
                                    └─────────────────┘
```

### Key MCP Concepts

#### 1. MCP Client (What We Have)
- **Purpose**: Makes requests to MCP servers
- **Implementation**: Spring AI's `spring-ai-starter-mcp-client`
- **Configuration**: Points to MCP server URI

#### 2. MCP Server (What We Need)
- **Purpose**: Implements MCP protocol and connects to external services
- **Responsibilities**:
  - Handle MCP protocol messages
  - Authenticate with Kite API
  - Transform requests/responses
  - Manage sessions and tokens

#### 3. MCP Protocol
- **JSON-RPC Based**: Uses JSON-RPC 2.0 for communication
- **Methods**: Standardized method names for different operations
- **Error Handling**: Structured error responses

### Current Implementation Status

#### What We Have Working:
- ✅ Spring Boot REST API with proper structure
- ✅ MCP client configuration
- ✅ Connection test endpoint
- ✅ Mock implementations for development
- ✅ OpenAPI documentation

#### What We Need:
- ❌ Actual MCP server implementation
- ❌ Kite API integration
- ❌ Authentication handling
- ❌ Real trading operations

### Next Steps Options

#### Option 1: Find Existing Kite MCP Server
- Search GitHub for "kite mcp server" implementations
- Check MCP server registries
- Look for community-built solutions

#### Option 2: Build MCP Server
- Create a separate MCP server project
- Implement MCP protocol handlers
- Integrate Kite Connect API
- Handle authentication and session management

#### Option 3: Direct Kite Integration
- Remove MCP layer
- Use Kite Connect API directly in our Spring Boot app
- Handle authentication in our service layer

### MCP Configuration Best Practices
- **Environment Variables**: Store sensitive config (API keys) in environment variables
- **Health Checks**: Implement connection testing (we have this!)
- **Error Handling**: Graceful degradation when MCP server is unavailable
- **Logging**: Comprehensive logging for debugging MCP communication

### Common MCP Patterns
- **Tool Calling**: AI models can call specific tools/functions
- **Context Retrieval**: Get relevant data for AI processing
- **Action Execution**: Perform real-world actions (like placing trades)

### MCP Server Hosting, Security, and Architecture Nuances

#### Public vs. Self-hosted MCP Server
- **Zerodha provides a public MCP server** at `https://mcp.kite.trade/mcp` for read-only operations (fetching holdings, positions, quotes, etc.).
- **Trading operations (place/cancel/modify orders) are disabled** on the public server for security reasons.
- **To place real orders, you must self-host** the MCP server (see [zerodha/kite-mcp-server](https://github.com/zerodha/kite-mcp-server)) and configure it with your own Kite API credentials.

#### Why Not Use Public MCP for Trading?
- The public MCP server does **not** have your Kite API credentials, so it cannot place orders for you.
- Allowing trading from a public server would be a major security risk (anyone could potentially place trades on your behalf).
- **Self-hosting keeps your API keys and secrets private and under your control.**

#### Security Best Practices
- **Never share your Kite API key/secret** with anyone or any public server.
- **Self-hosted MCP server** should be protected (firewall, VPN, or run only on trusted networks).
- **Public MCP server** is safe for read-only use, as it cannot modify your account and does not require your credentials.

#### Architecture Recap
- Your Spring Boot app communicates with the MCP server (public or self-hosted).
- The MCP server handles all communication with the Kite Connect API.
- The JSON config in your app only points to the MCP server; it does not implement any business logic.
- For trading, always use a self-hosted MCP server with your credentials.

#### References
- [Zerodha Kite MCP Server GitHub](https://github.com/zerodha/kite-mcp-server)
- [Kite MCP Hosted Docs](https://github.com/zerodha/kite-mcp-server#quick-start)

---

## Spring AI Learnings
- **Spring AI Integration**: Use the `spring-ai-starter-mcp-client` for connecting to Model Context Protocol (MCP) servers.
- **Configuration**: Set up MCP client properties in `application.properties` for clean separation of config and code.
- **Service Layer**: Encapsulate all AI/MCP logic in a dedicated service class (e.g., `KiteBrokerService`).
- **Mocking for Development**: When the real MCP server is unavailable, use mock implementations to keep the API testable and demo-ready.
- **Dependency Management**: Always check for the latest compatible versions of Spring AI and related libraries.

---

## REST API Design & Spring Boot
- **Controller Layer**: Keep controllers thin—only handle HTTP and delegate business logic to services.
- **Service Layer**: All business logic and external integrations go here.
- **DTOs**: Use Data Transfer Objects for request/response payloads. Place them in a `dto` package.
- **Validation**: Use `@Valid` and validation annotations in DTOs for input validation.
- **Exception Handling**: Use a global exception handler (`@RestControllerAdvice`) for consistent error responses.
- **CORS**: Use `@CrossOrigin` for enabling cross-origin requests if needed.
- **Logging**: Use meaningful log messages at key points (request received, error, etc.).

---

## OpenAPI & Contract-First Approach
- **External YAML**: Store your OpenAPI spec in `src/main/resources/openapi.yaml` for a contract-first, annotation-free approach.
- **Springdoc Config**: Point Swagger UI to your YAML via `springdoc.swagger-ui.url=/openapi.yaml` in `application.properties`.
- **Benefits**:
  - Keeps Java code clean (no doc annotations).
  - API contract is version-controlled and can be shared with frontend/clients.
  - Enables code generation for clients/servers.
- **Swagger UI**: Access at `/swagger-ui.html` to view and test your API.
- **Editing**: Use [Swagger Editor](https://editor.swagger.io/) for live editing and validation.

---

## Code Quality & Clean Code
- **Meaningful Names**: Use descriptive names for classes, methods, and variables (e.g., `KiteBrokerService`, `placeOrder`, `orderRequest`).
- **Single Responsibility**: Each class/method should do one thing well.
- **No Magic Numbers/Strings**: Use constants or enums for repeated values.
- **Consistent Formatting**: Use a code formatter and stick to a style guide.
- **No Business Logic in Controllers**: Always delegate to services.
- **Keep Methods Short**: If a method is getting long, break it up.
- **Use Plural Names for Collections**: e.g., `positions`, `holdings`.
- **Boolean Naming**: Use `is`, `has`, `should` prefixes for booleans.
- **Avoid Abbreviations**: Unless industry standard (e.g., `API`, `DTO`).

---

## Validation & Error Handling
- **DTO Validation**: Use `@NotBlank`, `@NotNull`, `@Positive`, etc. in DTOs.
- **Global Exception Handler**: Use `@RestControllerAdvice` to catch and format errors.
- **Consistent Error Responses**: Return structured error objects (see OpenAPI spec for examples).
- **Log Errors**: Always log errors with enough context for debugging.

---

## Testing & Debugging
- **Unit Tests**: Write tests for service logic and edge cases.
- **Integration Tests**: Test the full API flow (controller + service + validation).
- **Mocking**: Use mock data/services when external dependencies are unavailable.
- **Manual Testing**: Use `curl`, Postman, or Swagger UI for quick endpoint checks.
- **Logs**: Check logs for errors, warnings, and info during development.

---

## Useful Tools & Resources
- **Swagger Editor**: https://editor.swagger.io/
- **OpenAPI Generator**: https://openapi-generator.tech/
- **Spring AI Docs**: https://docs.spring.io/spring-ai/
- **Spring Boot Docs**: https://docs.spring.io/spring-boot/
- **Lombok**: https://projectlombok.org/
- **Stoplight**: https://stoplight.io/
- **Springdoc**: https://springdoc.org/

---

## How to Contribute to This Document
- Add new learnings, tips, or code snippets as you discover them.
- If you refactor or improve code, document the reason and the before/after here.
- Use this as a team knowledge base and onboarding guide!

---

**Happy coding and learning together!** 