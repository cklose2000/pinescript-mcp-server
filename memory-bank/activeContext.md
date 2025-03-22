# Active Context

## Current Focus
The current focus is on implementing Phase 3 of the PineScript MCP project, focusing on the Enhanced Prompt Engineering tasks, with an emphasis on testing and stabilizing the template system. We are ensuring all tests pass correctly and that the template vector store integration functions properly.

## Recent Changes
1. Implemented a comprehensive template structure system for managing prompt templates
2. Created dedicated templates for strategy analysis, backtest analysis, and strategy enhancement
3. Updated the LLM service to use the new template system with backward compatibility
4. Added testing capabilities for template generation
5. Updated the directory structure to include a dedicated prompts module
6. Fixed issues in the template system tests to ensure proper validation and rendering
7. Resolved references to the correct template embedding method in vector store tests
8. Successfully ran the test suite with all tests passing

## Next Steps
1. Continue implementing the Enhanced Prompt Engineering phase:
   - Add specialized templates for optimization, educational content, and other use cases
   - Implement vector search improvements for semantic template discovery
   - Create template evaluation metrics
   - Add a template development workflow

2. Begin planning the Comprehensive Testing Framework:
   - Define test scenarios and expected outcomes
   - Set up test infrastructure
   - Develop automated test scripts

## Active Decisions
1. **Template Structure Design**: We've decided to use a standardized template structure with defined sections (introduction, task, context, examples, constraints, output format) to ensure consistency across different prompt types.

2. **Backward Compatibility**: To ensure a smooth transition, the updated LLM service maintains backward compatibility with the existing configuration-based templates while introducing the new template management system.

3. **ESM Module System**: We're using ES modules throughout the project, which requires attention to file extensions (.js) in import statements.

4. **Database Consolidation**: We've decided to focus on Supabase for both regular database storage and vector search capabilities, rather than using both Supabase and NeonDB. This will simplify the architecture and reduce potential integration issues.

## Technical Constraints
1. The project uses TypeScript with ES modules, requiring careful attention to import/export patterns.
2. We need to maintain compatibility with both OpenAI and Anthropic providers.
3. The system should allow for graceful fallback to mock providers for testing and when API connectivity issues occur.
4. Testing with TypeScript ES modules requires specific configuration and run commands, with some experimental loader warnings that need to be addressed.

## Current Issues
1. Some tests are marked as pending when Supabase is not configured, which is expected behavior but requires documentation.
2. Need to ensure consistent output formats across different LLM providers.

### Recently Completed

- Added LLM configuration in the user config system
- Created a service architecture for interacting with language models (OpenAI, Anthropic)
- Implemented a mock provider for development and testing
- Built CLI commands for strategy analysis and enhancement
- Created prompt templates for different types of strategy analysis
- Implemented the OpenAI provider with graceful fallback to mock provider
- Added commands for strategy enhancement and backtest analysis
- Created sample test data for backtest analysis
- Fixed OpenAI API key handling to properly extract multi-line keys from .env file
- Improved JSON response handling with better error tolerance and normalization
- Added more robust output formatting to handle undefined or missing properties
- Implemented the Anthropic provider with Claude API integration
- Created model-specific configuration for Claude models (opus, sonnet, haiku)
- Added a test command for Anthropic provider validation
- Implemented a vector store for template embeddings to enable semantic search
- Fixed the vector store testing to use the correct method name (storeTemplateEmbedding)
- Fixed template validation tests by creating properly structured templates with valid placeholders
- Fixed template rendering tests by directly using the assemblePrompt function with correct replacements

### Active Work

We have completed the implementation of the LLM integration with the following components:

1. **User Configuration for LLM**
   - Added new configuration section for LLM providers and settings
   - Created helper functions to update LLM-specific settings
   - Provided default configuration values for development
   - Added CLI command to update OpenAI and Anthropic API keys and provider settings
   - Implemented model-specific configurations for different Claude models

2. **LLM Service Architecture**
   - Created a service that selects the appropriate provider based on configuration
   - Designed interfaces for strategy analysis and enhancement
   - Implemented a mock provider for testing without API credentials
   - Added graceful fallback mechanism when API authentication fails
   - Enhanced with template-based prompt generation

3. **OpenAI Provider Implementation**
   - Created OpenAI provider that connects to the OpenAI API
   - Implemented proper error handling for API failures
   - Added JSON parsing for structured responses
   - Designed a custom method to extract API keys reliably from .env file
   - Added comprehensive debugging and logging for troubleshooting
   - Implemented JSON structure normalization for consistent response handling

4. **Anthropic Provider Implementation**
   - Implemented Anthropic provider using the Claude API
   - Added support for different Claude models (opus, sonnet, haiku)
   - Configured model-specific parameters (max tokens, temperature)
   - Created a test command to validate the Anthropic integration
   - Implemented robust error handling and JSON response parsing

5. **Template System Implementation**
   - Created a standardized template structure with validation
   - Implemented a template manager for loading and retrieving templates
   - Added support for template rendering with placeholder replacement
   - Created a repository for template storage in Supabase
   - Added a vector store for semantic search capabilities
   - Implemented CLI commands for template management
   - Added testing for template validation, rendering, and vector search

### Current Decisions

- Using a factory pattern to select the appropriate LLM provider
- Utilizing a mock implementation that returns realistic but static data when API authentication fails
- Successfully implemented both OpenAI and Anthropic providers
- Designing a system that can be extended to other providers in the future
- Successfully resolving OpenAI API key handling for multi-line .env file entries
- Supporting model-specific configurations for different LLM models
- Using Supabase for both regular database storage and vector search capabilities

### Key Milestones
- End of Week 3: Review prompt engineering improvements
- End of Week 7: Evaluate testing framework effectiveness
- End of Week 10: Demo dashboard with basic visualization
- End of Week 13: Complete project review with all deliverables

## Technical Context

- LLM service is in `src/services/llmService.ts`
- OpenAI provider is in `src/services/openaiProvider.ts`
- Anthropic provider is in `src/services/anthropicProvider.ts`
- CLI commands are in `src/cli/commands/llm.ts` and `src/cli/commands/templates.ts`
- Anthropic test command is in `src/cli/commands/test-anthropic.ts`
- Configuration updates are in `src/config/userConfig.ts`
- Example strategies for testing are in `examples/`
- Backtest sample data is in `examples/backtest-results.json`
- Test utilities are in `src/tests/`
- Template manager is in `src/prompts/templateManager.ts`
- Template structure is in `src/prompts/templateStructure.ts`
- Template repository is in `src/prompts/templateRepository.ts`
- Template vector store is in `src/prompts/templateVectorStore.ts`
- Supabase client is in `src/db/supabaseClient.ts`
- Vector store is in `src/db/vector/vectorStore.ts` 