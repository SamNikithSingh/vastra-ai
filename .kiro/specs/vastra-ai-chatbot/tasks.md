# Implementation Plan: Vastra AI Chatbot

## Overview

This implementation plan breaks down the Vastra AI chatbot into discrete coding tasks. The application will be built as a single HTML file with embedded CSS and vanilla JavaScript, implementing a conversational interface for AI-powered Indian fashion design generation using the Hugging Face FLUX.1-schnell model.

The implementation follows a progressive approach: core infrastructure first, then UI components, then image generation, and finally polish and error handling.

## Tasks

- [x] 1. Set up project structure and core HTML skeleton
  - Create single `index.html` file with basic HTML5 structure
  - Add Google Fonts CDN links for Cormorant Garamond and DM Sans
  - Define CSS custom properties for design tokens (colors, fonts, spacing)
  - Create main layout containers: header, chat container, input bar
  - _Requirements: 11.1, 11.2, 11.7, 10.1, 10.2, 10.3_

- [ ] 2. Implement state management system
  - [x] 2.1 Create StateManager class with state object and subscriber pattern
    - Implement getState(), setState(), and subscribe() methods
    - Define AppState interface with all required state properties
    - Add specific state operations: addMessage, updateGeneration, setAPIKey, etc.
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 2.2 Write property test for state management
    - **Property: State updates trigger subscribers**
    - *For any* state update, all subscribed listeners should be called with the new state
    - **Validates: Requirements N/A (internal correctness)**

- [ ] 3. Implement localStorage API key management
  - [x] 3.1 Create StorageManager class with save, get, and delete methods
    - Implement saveAPIKey() to store key with name "vastra_hf_key"
    - Implement getAPIKey() to retrieve key from localStorage
    - Implement deleteAPIKey() to remove key from localStorage
    - _Requirements: 4.3, 11.6, 10_
  
  - [ ]* 3.2 Write property test for API key persistence
    - **Property 10: API key persistence**
    - *For any* API key saved through the settings interface, the key should be stored in localStorage with the key name "vastra_hf_key"
    - **Validates: Requirements 4.3, 11.6**

- [ ] 4. Build header component
  - [x] 4.1 Create renderHeader() function
    - Render "Vastra AI" brand name with Cormorant Garamond font
    - Add API status indicator dot (green/red based on key existence)
    - Add gear icon settings button
    - Implement click handlers for status dot and settings icon
    - Add pulsing animation for red status dot
    - Add tooltip for red status dot
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 4.2 Write unit tests for header interactions
    - Test clicking gear icon opens settings
    - Test clicking status dot opens settings
    - Test tooltip appears on hover
    - _Requirements: 5.6, 5.7_

- [ ] 5. Build settings drawer component
  - [x] 5.1 Create renderSettingsDrawer() function
    - Implement sliding drawer with backdrop overlay
    - Add API key input section with password field
    - Implement API key masking display (show last 6 chars as "hf_...xYz123")
    - Add Save and Delete buttons with click handlers
    - Add green checkmark confirmation animation (2 seconds)
    - Add API status indicator section
    - Add Model Info section with static content
    - Add "How to Get API Key" instructions section
    - Implement close on outside click and Escape key
    - Add responsive styling: 360px on desktop, full width on mobile (<480px)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 12.1-12.7_
  
  - [ ]* 5.2 Write property test for API key masking
    - **Property 9: API key masking**
    - *For any* saved API key, when displayed in the settings UI, only the last 6 characters should be visible in the format "hf_...xYz123"
    - **Validates: Requirements 4.2**
  
  - [ ]* 5.3 Write property test for status indicator state
    - **Property 11: Status indicator state**
    - *For any* application state, if an API key exists in localStorage, the status indicator should display green with text "API Key Saved"; otherwise, it should display red with text "No API Key"
    - **Validates: Requirements 4.7, 4.8**
  
  - [ ]* 5.4 Write property test for responsive drawer width
    - **Property 23: Responsive drawer width**
    - *For any* viewport width less than 480px, the settings drawer should be full width; otherwise, it should be 360px wide
    - **Validates: Requirements 3.6, 10.9**
  
  - [ ]* 5.5 Write unit tests for settings drawer interactions
    - Test drawer opens and closes correctly
    - Test Escape key closes drawer
    - Test outside click closes drawer
    - Test Save button stores key and shows confirmation
    - Test Delete button removes key and clears input
    - _Requirements: 3.4, 4.4, 4.5_

- [ ] 6. Build chat interface components
  - [x] 6.1 Create renderChatInterface() function
    - Implement full-screen chat layout
    - Add welcome screen with greeting message
    - Add 6 quick suggestion chips
    - Create message list container with auto-scroll
    - _Requirements: 6.1, 6.2_
  
  - [x] 6.2 Create renderMessage() function
    - Implement user message bubbles (right-aligned, dark styling)
    - Implement AI message bubbles (left-aligned, light styling)
    - Add support for attaching design cards to AI messages
    - _Requirements: 6.3, 6.4_
  
  - [x] 6.3 Create input bar component
    - Add fixed bottom textarea with auto-resize (max 3 lines)
    - Add send button
    - Implement Enter key to send (Shift+Enter for newline)
    - _Requirements: 6.5, 6.6, 6.7, 6.8_
  
  - [ ]* 6.4 Write property test for message styling consistency
    - **Property 12: Message styling consistency**
    - *For any* chat message, user messages should be right-aligned with dark styling, and AI messages should be left-aligned with light styling
    - **Validates: Requirements 6.3, 6.4**
  
  - [ ]* 6.5 Write property test for textarea auto-resize
    - **Property 13: Textarea auto-resize**
    - *For any* text content in the input textarea, the textarea should automatically resize to fit the content up to a maximum of 3 lines
    - **Validates: Requirements 6.8**
  
  - [ ]* 6.6 Write unit tests for input interactions
    - Test Enter key sends message
    - Test Shift+Enter adds newline
    - Test send button click sends message
    - _Requirements: 6.6, 6.7_

- [x] 7. Checkpoint - Ensure UI components render correctly
  - Verify header displays with correct styling
  - Verify settings drawer opens/closes properly
  - Verify chat interface displays welcome screen
  - Verify input bar is functional
  - Ask the user if questions arise

- [ ] 8. Implement prompt builder module
  - [x] 8.1 Create PromptBuilder class
    - Implement buildMannequinPrompt() with exact template
    - Implement buildDetailPrompt() with exact template
    - Implement getDetailParts() returning array of 6 parts
    - Ensure user text is used exactly without modification
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 8.2 Write property test for user text preservation
    - **Property 2: User text preservation in prompts**
    - *For any* user input text, the generated prompts should contain that exact text without any modification, keyword extraction, or rewriting
    - **Validates: Requirements 2.1, 2.5**
  
  - [ ]* 8.3 Write property test for mannequin prompt template
    - **Property 3: Mannequin prompt template compliance**
    - *For any* mannequin view generation, the prompt should follow the template with user text appended
    - **Validates: Requirements 2.2**
  
  - [ ]* 8.4 Write property test for detail prompt template
    - **Property 4: Detail shot prompt template compliance**
    - *For any* detail shot generation, the prompt should follow the template with correct part and user text
    - **Validates: Requirements 2.3**
  
  - [ ]* 8.5 Write property test for detail parts coverage
    - **Property 5: Complete detail parts coverage**
    - *For any* generation request, the system should generate detail shots for exactly these six parts: bodice front, bodice back, sleeve detail, skirt hem, dupatta, embroidery detail
    - **Validates: Requirements 2.4**

- [ ] 9. Implement Hugging Face API client
  - [x] 9.1 Create HuggingFaceClient class
    - Implement constructor accepting API key
    - Implement generateImage() method with POST request to HF API
    - Use endpoint: https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell
    - Build headers with Authorization Bearer token and Content-Type JSON
    - Send request body with "inputs" field containing prompt
    - Return image blob from response
    - Implement error handling for 401, 429, 503, and network errors
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 11.5_
  
  - [ ]* 9.2 Write property test for API request authentication
    - **Property 6: API request authentication**
    - *For any* API request to Hugging Face, the request should include an Authorization header in Bearer token format
    - **Validates: Requirements 1.6**
  
  - [ ]* 9.3 Write property test for API request body structure
    - **Property 7: API request body structure**
    - *For any* API request to Hugging Face, the request body should be valid JSON containing an "inputs" field with the prompt text
    - **Validates: Requirements 1.7**
  
  - [ ]* 9.4 Write property test for image blob conversion
    - **Property 8: Image blob conversion**
    - *For any* received image blob from the API, the system should convert it to a displayable format (base64 data URL or object URL)
    - **Validates: Requirements 1.8**
  
  - [ ]* 9.5 Write unit tests for error handling
    - Test missing API key error
    - Test invalid token error (401)
    - Test rate limit error (429)
    - Test model loading error (503)
    - Test network error
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 10. Implement generation orchestrator
  - [x] 10.1 Create GenerationOrchestrator class
    - Implement generateDesign() method to orchestrate full 7-image sequence
    - Implement generateMannequin() to create mannequin view
    - Implement generateDetails() to create 6 detail shots sequentially
    - Implement extractOutfitMetadata() for title, occasion, fabric
    - Update state progressively as each image completes
    - Convert blobs to object URLs for display
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.9, 7.10_
  
  - [ ]* 10.2 Write property test for complete image set generation
    - **Property 1: Complete image set generation**
    - *For any* valid outfit description, the system should generate exactly 7 images: 1 mannequin view at 768x1024px resolution and 6 detail shots at 512x512px resolution
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [ ]* 10.3 Write property test for generation confirmation message
    - **Property 14: Generation confirmation message**
    - *For any* generation start event, the system should display a confirmation bubble containing the text "Got it! Generating your [outfit]..."
    - **Validates: Requirements 7.2**
  
  - [ ]* 10.4 Write property test for design card completeness
    - **Property 15: Design card completeness**
    - *For any* displayed design card, it should contain outfit title, occasion label, and fabric label
    - **Validates: Requirements 7.3**
  
  - [ ]* 10.5 Write property test for progress tracking accuracy
    - **Property 16: Progress tracking accuracy**
    - *For any* active generation, the progress bar should accurately show the current image number out of 7 total
    - **Validates: Requirements 7.4**
  
  - [ ]* 10.6 Write property test for progress label accuracy
    - **Property 17: Progress label accuracy**
    - *For any* generation step, the progress label should indicate which specific image is currently being generated
    - **Validates: Requirements 7.5**
  
  - [ ]* 10.7 Write property test for progressive skeleton replacement
    - **Property 18: Progressive skeleton replacement**
    - *For any* completed detail shot, the skeleton placeholder should be replaced with the actual image while other pending images remain as skeletons
    - **Validates: Requirements 7.10**

- [ ] 11. Build design card component
  - [x] 11.1 Create renderDesignCard() function
    - Display outfit title, occasion, and fabric labels
    - Show progress bar with gradient (rose to gold)
    - Display progress label text
    - Render mannequin skeleton that updates to image when ready
    - Add "Hover to view full size or download" hint text
    - Add download button for mannequin view
    - Render 3x2 grid of detail shot skeletons
    - Update skeletons to images as they arrive
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [x] 11.2 Create skeleton loader component with shimmer animation
    - Implement CSS shimmer animation in cream tones
    - _Requirements: 10.6_
  
  - [ ]* 11.3 Write unit tests for design card rendering
    - Test card displays all required elements
    - Test progress bar updates correctly
    - Test skeletons are replaced with images
    - _Requirements: 7.3, 7.6, 7.9, 7.10_

- [ ] 12. Implement image interaction features
  - [x] 12.1 Add hover overlay to images
    - Display overlay with View and Save buttons on hover
    - _Requirements: 8.1_
  
  - [ ] 12.2 Create lightbox component
    - Implement renderLightbox() function
    - Display full-screen dark overlay with centered image
    - Show image label at top
    - Add Download and Close buttons
    - Implement Escape key to close
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 12.3 Implement image download functionality
    - Trigger PNG download with correct filename format
    - Use format: outfit name + part name
    - _Requirements: 8.6, 8.7_
  
  - [ ]* 12.4 Write property test for image hover overlay
    - **Property 19: Image hover overlay**
    - *For any* generated image, hovering over it should display an overlay containing View and Save buttons
    - **Validates: Requirements 8.1**
  
  - [ ]* 12.5 Write property test for lightbox content completeness
    - **Property 20: Lightbox content completeness**
    - *For any* open lightbox, it should display the image label at the top, the image itself, and both Download and Close buttons
    - **Validates: Requirements 8.3, 8.4**
  
  - [ ]* 12.6 Write property test for image download format
    - **Property 21: Image download format**
    - *For any* image save action, the system should trigger a download of the image as a PNG file
    - **Validates: Requirements 8.6**
  
  - [ ]* 12.7 Write property test for download filename format
    - **Property 22: Download filename format**
    - *For any* image download, the filename should follow the format: outfit name + part name
    - **Validates: Requirements 8.7**
  
  - [ ]* 12.8 Write unit tests for image interactions
    - Test hover overlay appears
    - Test View button opens lightbox
    - Test Save button triggers download
    - Test Escape key closes lightbox
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 13. Checkpoint - Ensure image generation flow works end-to-end
  - Test full generation sequence with mock API
  - Verify all 7 images are generated and displayed
  - Verify progress updates correctly
  - Verify image interactions work
  - Ask the user if questions arise

- [ ] 14. Implement error handling system
  - [ ] 14.1 Create ErrorHandler class
    - Implement classifyError() to map errors to ErrorType
    - Implement getErrorMessage() to return user-friendly messages
    - Implement shouldAutoOpenSettings() for NO_API_KEY error
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ] 14.2 Add error handling to message send flow
    - Check for API key before sending
    - Display error bubble if no key exists
    - Auto-open settings drawer for NO_API_KEY error
    - _Requirements: 9.1, 9.2_
  
  - [ ] 14.3 Add error handling to API client
    - Handle 401 Invalid Token error
    - Handle 429 Rate Limit error
    - Handle 503 Model Loading error
    - Handle network errors
    - Display appropriate error messages
    - _Requirements: 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 14.4 Write unit tests for all error scenarios
    - Test missing API key error and auto-open settings
    - Test invalid token error message
    - Test rate limit error message
    - Test model loading info message
    - Test network error message
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 15. Add typing indicator and completion messages
  - [ ] 15.1 Create typing indicator component
    - Display 3 animated dots when generation starts
    - _Requirements: 7.1_
  
  - [ ] 15.2 Add completion bubble with variation suggestions
    - Display after all 7 images complete
    - Include suggestion chips for variations
    - _Requirements: 7.11_
  
  - [ ]* 15.3 Write unit tests for generation flow UI
    - Test typing indicator appears
    - Test completion bubble appears after generation
    - _Requirements: 7.1, 7.11_

- [ ] 16. Polish and finalize styling
  - [ ] 16.1 Apply design system colors and fonts
    - Verify all colors match design tokens
    - Verify fonts are loaded from Google Fonts CDN
    - Apply subtle hover states to all buttons
    - _Requirements: 10.1, 10.2, 10.3, 10.7, 10.8_
  
  - [ ] 16.2 Add animations and transitions
    - Settings drawer slide-in animation
    - Progress bar gradient animation
    - Skeleton shimmer animation
    - Button hover transitions
    - _Requirements: 10.5, 10.6, 10.7_
  
  - [ ] 16.3 Verify responsive design
    - Test on mobile viewport (<480px)
    - Test on tablet viewport (480-768px)
    - Test on desktop viewport (>768px)
    - Ensure settings drawer is full width on mobile
    - _Requirements: 3.6, 6.1, 10.9_

- [ ] 17. Final integration and testing
  - [ ] 17.1 Wire all components together
    - Connect state manager to all UI components
    - Ensure all event handlers are properly bound
    - Verify localStorage persistence works across page reloads
    - Test complete user flow from API key setup to image generation
    - _Requirements: All_
  
  - [ ]* 17.2 Run full property test suite
    - Execute all 23 property tests with 100 iterations each
    - Verify all properties pass
    - Fix any failures
  
  - [ ]* 17.3 Run full unit test suite
    - Execute all unit tests
    - Verify all tests pass
    - Achieve comprehensive coverage

- [ ] 18. Final checkpoint - Complete application validation
  - Test complete user journey: open app → set API key → describe outfit → generate images → view/download
  - Verify all error scenarios work correctly
  - Verify responsive design on multiple devices
  - Verify all 12 requirements are satisfied
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The single-file architecture means all code goes into one `index.html` file
- No build tools or frameworks are used - pure vanilla JavaScript, HTML, and CSS
