# Design Document: Vastra AI Chatbot

## Overview

Vastra AI is a single-page web application that provides a conversational interface for generating AI-powered Indian women's fashion designs. The application uses the Hugging Face FLUX.1-schnell model to generate high-quality fashion photography including full mannequin views and detailed close-up shots of garment components.

The design follows a client-side only architecture with no backend dependencies, using browser localStorage for API key persistence and direct fetch calls to Hugging Face's inference API. The interface is built with vanilla JavaScript, HTML, and CSS to ensure simplicity, portability, and ease of deployment.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Environment                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Vastra AI Single Page App                 │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   UI Layer   │  │  State Mgmt  │  │  API Client │ │ │
│  │  │              │  │              │  │             │ │ │
│  │  │ - Header     │  │ - Chat Msgs  │  │ - HF Fetch  │ │ │
│  │  │ - Chat UI    │  │ - Settings   │  │ - Image Gen │ │ │
│  │  │ - Settings   │  │ - Gen State  │  │ - Error Hdl │ │ │
│  │  │ - Lightbox   │  │              │  │             │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │           localStorage (API Key)                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS POST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Hugging Face Inference API                      │
│         black-forest-labs/FLUX.1-schnell                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Layers

1. **UI Layer**: Renders all visual components including header, chat interface, settings drawer, and image lightbox
2. **State Management**: Maintains application state for chat messages, settings, and generation progress
3. **API Client**: Handles all HTTP communication with Hugging Face API
4. **Storage Layer**: Browser localStorage for API key persistence

### Data Flow

1. User enters outfit description → UI captures input
2. State manager validates API key exists
3. API client constructs 7 prompts (1 mannequin + 6 details)
4. Sequential API calls to Hugging Face (one at a time to show progress)
5. Each response blob converted to object URL
6. UI updates progressively as each image arrives
7. Final state: all 7 images displayed in design card

## Components and Interfaces

### 1. Application State

```javascript
const AppState = {
  apiKey: string | null,           // HF API token from localStorage
  messages: Message[],              // Chat history
  currentGeneration: Generation | null,  // Active generation state
  settingsOpen: boolean,            // Settings drawer visibility
  lightboxImage: LightboxData | null    // Current lightbox image
}

interface Message {
  id: string,
  type: 'user' | 'ai' | 'system',
  content: string,
  timestamp: number,
  designCard?: DesignCard          // Attached design card for AI messages
}

interface Generation {
  id: string,
  userPrompt: string,
  outfitTitle: string,
  progress: number,                 // 0-7
  currentStep: string,              // "Generating mannequin view (1/7)..."
  mannequinImage: string | null,    // Object URL
  detailImages: DetailImage[]       // 6 detail shots
}

interface DetailImage {
  part: 'bodice front' | 'bodice back' | 'sleeve detail' | 
        'skirt hem' | 'dupatta' | 'embroidery detail',
  imageUrl: string | null,          // Object URL
  status: 'pending' | 'loading' | 'complete'
}

interface DesignCard {
  outfitTitle: string,
  occasion: string,
  fabric: string,
  mannequinUrl: string,
  detailImages: DetailImage[]
}

interface LightboxData {
  imageUrl: string,
  label: string,
  filename: string
}
```

### 2. API Client Module

```javascript
class HuggingFaceClient {
  constructor(apiKey: string)
  
  async generateImage(prompt: string): Promise<Blob>
  // Makes POST request to HF API
  // Returns: image blob or throws error
  
  private buildHeaders(): Headers
  // Returns: { Authorization: "Bearer <token>", Content-Type: "application/json" }
  
  private handleError(response: Response): Error
  // Maps HTTP errors to user-friendly messages
}
```

**API Request Format:**
```javascript
POST https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell
Headers: {
  "Authorization": "Bearer hf_xxxxxxxxxxxxx",
  "Content-Type": "application/json"
}
Body: {
  "inputs": "Professional Indian fashion photography, full length female mannequin..."
}
```

**API Response:**
- Success: Binary image blob (JPEG/PNG)
- Error 401: Invalid token
- Error 429: Rate limit exceeded
- Error 503: Model loading

### 3. Prompt Builder Module

```javascript
class PromptBuilder {
  static buildMannequinPrompt(userText: string): string
  // Returns: "Professional Indian fashion photography, full length female mannequin, 
  //          white studio background, soft studio lighting, fashion editorial style, 
  //          full body front facing, 4K, [userText]"
  
  static buildDetailPrompt(userText: string, part: string): string
  // Returns: "Fashion detail photography, extreme close-up of [part] of this outfit: 
  //          [userText], white background, 4K"
  
  static getDetailParts(): string[]
  // Returns: ['bodice front', 'bodice back', 'sleeve detail', 
  //          'skirt hem', 'dupatta', 'embroidery detail']
}
```

### 4. Generation Orchestrator

```javascript
class GenerationOrchestrator {
  constructor(apiClient: HuggingFaceClient, stateManager: StateManager)
  
  async generateDesign(userPrompt: string): Promise<void>
  // Orchestrates full 7-image generation sequence
  // Updates state progressively as each image completes
  
  private async generateMannequin(userPrompt: string): Promise<string>
  // Generates mannequin view, returns object URL
  
  private async generateDetails(userPrompt: string): Promise<DetailImage[]>
  // Generates 6 detail shots sequentially, returns array of DetailImage
  
  private extractOutfitMetadata(userPrompt: string): { title, occasion, fabric }
  // Simple heuristic extraction from user text
}
```

### 5. UI Components

#### Header Component
```javascript
function renderHeader(apiKeyExists: boolean): HTMLElement
// Renders: Brand name (left) + Status dot + Settings icon (right)
// Status dot: pulsing red (no key) or steady green (key exists)
// Clicking status dot or settings icon opens drawer
```

#### Chat Interface Component
```javascript
function renderChatInterface(messages: Message[]): HTMLElement
// Renders: Welcome screen or message list + input bar
// Auto-scrolls to bottom on new messages
// Handles Enter/Shift+Enter for send/newline

function renderMessage(message: Message): HTMLElement
// Renders: User bubble (right, dark) or AI bubble (left, light)
// Includes design card if present

function renderDesignCard(card: DesignCard, progress: number): HTMLElement
// Renders: Title + labels + progress bar + mannequin + detail grid
// Shows skeletons for pending images
```

#### Settings Drawer Component
```javascript
function renderSettingsDrawer(isOpen: boolean, apiKey: string | null): HTMLElement
// Renders: Sliding drawer from right with backdrop
// Sections: API key input, status indicator, model info, instructions
// Handles save/delete actions, updates localStorage

function renderAPIKeySection(apiKey: string | null): HTMLElement
// Renders: Password input (masked), save/delete buttons, helper text
// Shows last 6 chars if key exists: "hf_...xYz123"

function renderModelInfo(): HTMLElement
// Renders: Static info about FLUX.1-schnell model
```

#### Lightbox Component
```javascript
function renderLightbox(data: LightboxData | null): HTMLElement
// Renders: Full-screen overlay with centered image
// Includes: Image label, download button, close button
// Closes on Escape key or outside click
```

#### Skeleton Loader Component
```javascript
function renderSkeleton(width: number, height: number): HTMLElement
// Renders: Animated shimmer placeholder in cream tones
// CSS animation: linear gradient moving left to right
```

### 6. State Manager

```javascript
class StateManager {
  private state: AppState
  private listeners: Function[]
  
  getState(): AppState
  setState(updates: Partial<AppState>): void
  subscribe(listener: Function): void
  
  // Specific state operations
  addMessage(message: Message): void
  updateGeneration(updates: Partial<Generation>): void
  setAPIKey(key: string): void
  clearAPIKey(): void
  openSettings(): void
  closeSettings(): void
  openLightbox(data: LightboxData): void
  closeLightbox(): void
}
```

### 7. Storage Manager

```javascript
class StorageManager {
  static readonly API_KEY_STORAGE_KEY = 'vastra_hf_key'
  
  static saveAPIKey(key: string): void
  // Saves to localStorage
  
  static getAPIKey(): string | null
  // Retrieves from localStorage
  
  static deleteAPIKey(): void
  // Removes from localStorage
}
```

## Data Models

### Image Generation Workflow

```
User Input: "Red silk lehenga with gold zari work"
    ↓
Step 1: Generate Mannequin (1/7)
    Prompt: "Professional Indian fashion photography, full length female mannequin, 
             white studio background, soft studio lighting, fashion editorial style, 
             full body front facing, 4K, Red silk lehenga with gold zari work"
    Size: 768x1024px
    ↓
Step 2-7: Generate Details (2/7 through 7/7)
    For each part in [bodice front, bodice back, sleeve detail, skirt hem, dupatta, embroidery detail]:
        Prompt: "Fashion detail photography, extreme close-up of [part] of this outfit: 
                 Red silk lehenga with gold zari work, white background, 4K"
        Size: 512x512px
    ↓
Result: DesignCard with 7 images ready for display/download
```

### Error States

```javascript
enum ErrorType {
  NO_API_KEY = 'no_api_key',
  INVALID_TOKEN = 'invalid_token',
  RATE_LIMIT = 'rate_limit',
  MODEL_LOADING = 'model_loading',
  NETWORK_ERROR = 'network_error'
}

interface ErrorState {
  type: ErrorType,
  message: string,
  autoOpenSettings: boolean  // True for NO_API_KEY
}
```

### Visual Design Tokens

```javascript
const DesignTokens = {
  colors: {
    deepInk: '#1a1410',
    warmCream: '#faf6f1',
    roseAccent: '#c9847a',
    gold: '#c4a96b'
  },
  fonts: {
    heading: 'Cormorant Garamond, serif',
    body: 'DM Sans, sans-serif'
  },
  spacing: {
    drawerWidth: '360px',
    drawerWidthMobile: '100%',
    mobileBreakpoint: '480px'
  },
  animation: {
    drawerSlide: 'transform 0.3s ease-out',
    shimmer: 'shimmer 1.5s infinite linear'
  }
}
```

### Image Dimensions

```javascript
const ImageDimensions = {
  mannequin: { width: 768, height: 1024 },
  detail: { width: 512, height: 512 }
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:
- Requirements 2.1 and 2.5 both verify user text is not modified (2.5 is redundant)
- Requirements 3.6 and 10.9 both test responsive drawer width (10.9 is redundant)
- Requirements 4.3 and 11.6 both test localStorage key name (11.6 is redundant)
- Requirements 1.1, 1.2, and 1.3 can be combined into a single comprehensive property about image generation output
- Requirements 4.7 and 4.8 can be combined into a single property about status indicator state
- Requirements 6.3 and 6.4 can be combined into a single property about message styling

The following properties represent the unique, non-redundant validation requirements:

### Core Image Generation Properties

**Property 1: Complete image set generation**
*For any* valid outfit description, the system should generate exactly 7 images: 1 mannequin view at 768x1024px resolution and 6 detail shots at 512x512px resolution.
**Validates: Requirements 1.1, 1.2, 1.3**

**Property 2: User text preservation in prompts**
*For any* user input text, the generated prompts should contain that exact text without any modification, keyword extraction, or rewriting.
**Validates: Requirements 2.1, 2.5**

**Property 3: Mannequin prompt template compliance**
*For any* mannequin view generation, the prompt should follow the template: "Professional Indian fashion photography, full length female mannequin, white studio background, soft studio lighting, fashion editorial style, full body front facing, 4K, [USER_TEXT]" where USER_TEXT is the unmodified user input.
**Validates: Requirements 2.2**

**Property 4: Detail shot prompt template compliance**
*For any* detail shot generation, the prompt should follow the template: "Fashion detail photography, extreme close-up of [PART] of this outfit: [USER_TEXT], white background, 4K" where PART is one of the six required parts and USER_TEXT is the unmodified user input.
**Validates: Requirements 2.3**

**Property 5: Complete detail parts coverage**
*For any* generation request, the system should generate detail shots for exactly these six parts: bodice front, bodice back, sleeve detail, skirt hem, dupatta, embroidery detail.
**Validates: Requirements 2.4**

**Property 6: API request authentication**
*For any* API request to Hugging Face, the request should include an Authorization header in Bearer token format.
**Validates: Requirements 1.6**

**Property 7: API request body structure**
*For any* API request to Hugging Face, the request body should be valid JSON containing an "inputs" field with the prompt text.
**Validates: Requirements 1.7**

**Property 8: Image blob conversion**
*For any* received image blob from the API, the system should convert it to a displayable format (base64 data URL or object URL).
**Validates: Requirements 1.8**

### State Management Properties

**Property 9: API key masking**
*For any* saved API key, when displayed in the settings UI, only the last 6 characters should be visible in the format "hf_...xYz123".
**Validates: Requirements 4.2**

**Property 10: API key persistence**
*For any* API key saved through the settings interface, the key should be stored in localStorage with the key name "vastra_hf_key".
**Validates: Requirements 4.3, 11.6**

**Property 11: Status indicator state**
*For any* application state, if an API key exists in localStorage, the status indicator should display green with text "API Key Saved"; otherwise, it should display red with text "No API Key".
**Validates: Requirements 4.7, 4.8**

### UI Interaction Properties

**Property 12: Message styling consistency**
*For any* chat message, user messages should be right-aligned with dark styling, and AI messages should be left-aligned with light styling.
**Validates: Requirements 6.3, 6.4**

**Property 13: Textarea auto-resize**
*For any* text content in the input textarea, the textarea should automatically resize to fit the content up to a maximum of 3 lines.
**Validates: Requirements 6.8**

**Property 14: Generation confirmation message**
*For any* generation start event, the system should display a confirmation bubble containing the text "Got it! Generating your [outfit]..." where [outfit] references the user's description.
**Validates: Requirements 7.2**

**Property 15: Design card completeness**
*For any* displayed design card, it should contain outfit title, occasion label, and fabric label.
**Validates: Requirements 7.3**

**Property 16: Progress tracking accuracy**
*For any* active generation, the progress bar should accurately show the current image number out of 7 total (e.g., "3/7").
**Validates: Requirements 7.4**

**Property 17: Progress label accuracy**
*For any* generation step, the progress label should indicate which specific image is currently being generated (e.g., "Generating bodice front detail (3/7)...").
**Validates: Requirements 7.5**

**Property 18: Progressive skeleton replacement**
*For any* completed detail shot, the skeleton placeholder should be replaced with the actual image while other pending images remain as skeletons.
**Validates: Requirements 7.10**

**Property 19: Image hover overlay**
*For any* generated image, hovering over it should display an overlay containing View and Save buttons.
**Validates: Requirements 8.1**

**Property 20: Lightbox content completeness**
*For any* open lightbox, it should display the image label at the top, the image itself, and both Download and Close buttons.
**Validates: Requirements 8.3, 8.4**

**Property 21: Image download format**
*For any* image save action, the system should trigger a download of the image as a PNG file.
**Validates: Requirements 8.6**

**Property 22: Download filename format**
*For any* image download, the filename should follow the format: outfit name + part name (e.g., "red-silk-lehenga-bodice-front.png").
**Validates: Requirements 8.7**

### Responsive Design Properties

**Property 23: Responsive drawer width**
*For any* viewport width less than 480px, the settings drawer should be full width; otherwise, it should be 360px wide.
**Validates: Requirements 3.6, 10.9**

## Error Handling

### Error Detection and Classification

The system implements comprehensive error handling for all API interactions and user actions:

```javascript
class ErrorHandler {
  static classifyError(error: Error | Response): ErrorType
  // Maps errors to specific error types
  
  static getErrorMessage(errorType: ErrorType): string
  // Returns user-friendly error message
  
  static shouldAutoOpenSettings(errorType: ErrorType): boolean
  // Returns true only for NO_API_KEY error
}
```

### Error Scenarios

1. **Missing API Key (NO_API_KEY)**
   - Trigger: User attempts to generate images without saving API key
   - Response: Display error bubble with instructions, auto-open settings drawer
   - Message: "Please set your Hugging Face API key first. Click the ⚙️ settings icon in the top right to add it."

2. **Invalid Token (INVALID_TOKEN)**
   - Trigger: API returns 401 Unauthorized
   - Response: Display error bubble with instructions to check token
   - Message: "Invalid API key. Please check your token in ⚙️ Settings"

3. **Rate Limit (RATE_LIMIT)**
   - Trigger: API returns 429 Too Many Requests
   - Response: Display error bubble asking user to wait
   - Message: "Too many requests — please wait a moment and try again"

4. **Model Loading (MODEL_LOADING)**
   - Trigger: API returns 503 Service Unavailable with model loading indicator
   - Response: Display informational message about wait time
   - Message: "Model is warming up, first image takes 20-30 seconds..."

5. **Network Error (NETWORK_ERROR)**
   - Trigger: Fetch fails due to network issues
   - Response: Display error bubble with connectivity instructions
   - Message: "Connection failed. Please check your internet and try again"

### Error Recovery

- All errors are non-fatal and allow user to retry
- Settings drawer remains accessible during errors
- Previous chat history and generated images are preserved
- Failed generation attempts do not corrupt application state

### Error State Management

```javascript
interface ErrorState {
  hasError: boolean,
  errorType: ErrorType | null,
  errorMessage: string | null,
  timestamp: number
}

// Error state is cleared when:
// - User successfully generates new images
// - User manually dismisses error message
// - User updates API key (for token-related errors)
```

## Testing Strategy

### Dual Testing Approach

The Vastra AI chatbot requires both unit testing and property-based testing for comprehensive validation:

- **Unit tests**: Verify specific examples, edge cases, UI interactions, and error conditions
- **Property tests**: Verify universal properties across all inputs using randomized test data

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection**: Use **fast-check** for JavaScript property-based testing

**Configuration Requirements**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: vastra-ai-chatbot, Property {number}: {property_text}`

**Example Property Test Structure**:
```javascript
// Feature: vastra-ai-chatbot, Property 1: Complete image set generation
test('generates exactly 7 images with correct dimensions', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 10, maxLength: 200 }), // Random outfit descriptions
      async (outfitDescription) => {
        const result = await generateDesign(outfitDescription);
        
        // Should have exactly 7 images
        expect(result.images).toHaveLength(7);
        
        // First image should be mannequin at 768x1024
        expect(result.images[0].width).toBe(768);
        expect(result.images[0].height).toBe(1024);
        
        // Remaining 6 should be details at 512x512
        for (let i = 1; i < 7; i++) {
          expect(result.images[i].width).toBe(512);
          expect(result.images[i].height).toBe(512);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Focus Areas

Unit tests should focus on:

1. **Specific UI Interactions**
   - Clicking gear icon opens settings drawer
   - Clicking outside drawer closes it
   - Escape key closes drawer and lightbox
   - Enter key sends message, Shift+Enter adds newline

2. **Edge Cases**
   - Empty API key input
   - Very long outfit descriptions
   - Special characters in user input
   - Rapid successive generation requests

3. **Error Conditions**
   - Missing API key scenario
   - Invalid token response
   - Rate limit response
   - Network failure
   - Model loading state

4. **Integration Points**
   - localStorage save/retrieve/delete operations
   - API request construction
   - Image blob to URL conversion
   - Download trigger mechanism

5. **Visual Regression**
   - Settings drawer layout
   - Chat message styling
   - Design card structure
   - Lightbox appearance

### Test Data Generators

For property-based tests, create generators for:

```javascript
// Random outfit descriptions
const outfitDescriptionArbitrary = fc.string({ 
  minLength: 10, 
  maxLength: 500 
});

// Random API keys (valid format)
const apiKeyArbitrary = fc.string({ minLength: 20 })
  .map(s => `hf_${s}`);

// Random detail parts
const detailPartArbitrary = fc.constantFrom(
  'bodice front', 'bodice back', 'sleeve detail',
  'skirt hem', 'dupatta', 'embroidery detail'
);

// Random viewport dimensions
const viewportArbitrary = fc.record({
  width: fc.integer({ min: 320, max: 1920 }),
  height: fc.integer({ min: 568, max: 1080 })
});
```

### Testing Priorities

**High Priority** (must test):
- Image generation completeness (Property 1)
- User text preservation (Property 2)
- Prompt template compliance (Properties 3, 4)
- API key persistence (Property 10)
- Error handling for missing API key

**Medium Priority** (should test):
- UI interaction properties (Properties 12-22)
- Status indicator state (Property 11)
- Responsive behavior (Property 23)
- Progress tracking (Properties 16, 17)

**Low Priority** (nice to test):
- Visual styling details
- Animation timing
- Tooltip behavior
- Suggestion chip interactions

### Mocking Strategy

For testing without actual API calls:

```javascript
// Mock Hugging Face API client
class MockHuggingFaceClient {
  async generateImage(prompt) {
    // Return mock blob based on prompt
    return new Blob([/* mock image data */], { type: 'image/png' });
  }
}

// Mock localStorage
const mockLocalStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
```

### Continuous Validation

- Run property tests on every commit (CI/CD integration)
- Run full test suite before deployment
- Monitor test execution time (property tests may be slower)
- Track test coverage for both unit and property tests
- Maintain test documentation alongside code
