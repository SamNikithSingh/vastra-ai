# Requirements Document: Vastra AI Chatbot

## Introduction

Vastra AI is a single-page web application that enables users to describe Indian women's clothing designs in natural language and generates AI-powered fashion images using the Hugging Face FLUX.1-schnell model. The application provides a conversational interface for fashion design exploration with detailed visual outputs including full mannequin views and close-up detail shots.

## Glossary

- **System**: The Vastra AI web application
- **User**: A person interacting with the chatbot to generate fashion designs
- **Mannequin_View**: Full-length fashion photograph showing complete outfit (768x1024px)
- **Detail_Shot**: Close-up photograph of specific garment component (512x512px)
- **Settings_Drawer**: Sliding panel interface for configuration options
- **API_Key**: Hugging Face authentication token stored in browser localStorage
- **Design_Card**: UI component displaying generated images with progress tracking
- **Lightbox**: Full-screen image viewer overlay
- **HF_API**: Hugging Face Inference API endpoint for FLUX.1-schnell model

## Requirements

### Requirement 1: Image Generation System

**User Story:** As a user, I want to generate multiple views of my described outfit, so that I can see both the complete design and detailed components.

#### Acceptance Criteria

1. WHEN a user submits an outfit description, THE System SHALL generate exactly 7 images per request
2. THE System SHALL generate one Mannequin_View at 768x1024 pixel resolution
3. THE System SHALL generate six Detail_Shots at 512x512 pixel resolution each
4. THE System SHALL use the Hugging Face Inference API with model black-forest-labs/FLUX.1-schnell
5. WHEN making API requests, THE System SHALL use POST method to https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell
6. WHEN making API requests, THE System SHALL include Authorization header with Bearer token format
7. WHEN making API requests, THE System SHALL send JSON body with "inputs" field containing the prompt
8. WHEN receiving API responses, THE System SHALL convert binary image blobs to displayable format using base64 or object URLs

### Requirement 2: Prompt Engineering

**User Story:** As a user, I want my exact description to be used for image generation, so that the output matches my creative vision without interpretation.

#### Acceptance Criteria

1. THE System SHALL use the user's exact typed text directly in image generation prompts without modification
2. WHEN generating Mannequin_View, THE System SHALL use template: "Professional Indian fashion photography, full length female mannequin, white studio background, soft studio lighting, fashion editorial style, full body front facing, 4K, [USER EXACT TEXT]"
3. WHEN generating Detail_Shots, THE System SHALL use template: "Fashion detail photography, extreme close-up of [PART] of this outfit: [USER EXACT TEXT], white background, 4K"
4. THE System SHALL generate Detail_Shots for these six parts: bodice front, bodice back, sleeve detail, skirt hem, dupatta, embroidery detail
5. THE System SHALL NOT extract keywords or rewrite user input before sending to the model

### Requirement 3: Settings Panel Interface

**User Story:** As a user, I want to configure my API key through an accessible settings panel, so that I can authenticate with the image generation service.

#### Acceptance Criteria

1. WHEN a user clicks the gear icon in the header, THE System SHALL open the Settings_Drawer
2. THE Settings_Drawer SHALL slide in from the right side as an overlay
3. WHEN the Settings_Drawer is open, THE System SHALL display a dark semi-transparent backdrop
4. WHEN a user clicks outside the Settings_Drawer or presses Escape key, THE System SHALL close the drawer
5. THE Settings_Drawer SHALL be 360px wide on desktop screens
6. WHERE the viewport width is less than 480px, THE Settings_Drawer SHALL be full width

### Requirement 4: API Key Management

**User Story:** As a user, I want to securely save and manage my Hugging Face API key, so that I can authenticate image generation requests.

#### Acceptance Criteria

1. THE Settings_Drawer SHALL display a password input field labeled "Hugging Face API Key"
2. WHEN an API_Key is saved, THE System SHALL display only the last 6 characters in format "hf_...xYz123"
3. WHEN a user clicks the Save button, THE System SHALL store the API_Key in localStorage with key "vastra_hf_key"
4. WHEN an API_Key is successfully saved, THE System SHALL display a green checkmark confirmation for 2 seconds
5. WHEN a user clicks the Delete button, THE System SHALL remove the API_Key from localStorage and clear the input field
6. THE Settings_Drawer SHALL display helper text: "Get your free API key at huggingface.co/settings/tokens" with a clickable link opening in new tab
7. WHEN an API_Key exists in localStorage, THE System SHALL display green dot with text "API Key Saved"
8. WHEN no API_Key exists in localStorage, THE System SHALL display red dot with text "No API Key"

### Requirement 5: Header Design

**User Story:** As a user, I want a clear header with branding and quick access to settings, so that I can easily navigate the application.

#### Acceptance Criteria

1. THE System SHALL display "Vastra AI" brand name in the header left side using Cormorant Garamond font
2. THE System SHALL display an API status indicator dot in the header right side
3. THE System SHALL display a gear icon settings button in the header right side
4. WHEN no API_Key is saved, THE System SHALL display a pulsing red status dot
5. WHEN an API_Key is saved, THE System SHALL display a steady green status dot
6. WHEN a user clicks the status dot, THE System SHALL open the Settings_Drawer
7. WHEN a user hovers over the red status dot, THE System SHALL display tooltip "Set API Key to start"

### Requirement 6: Chat Interface

**User Story:** As a user, I want a conversational interface to describe outfits, so that I can interact naturally with the design system.

#### Acceptance Criteria

1. THE System SHALL display a full-screen chat layout with mobile-first responsive design
2. WHEN the application loads, THE System SHALL display a welcome message with 6 quick suggestion chips
3. THE System SHALL display user messages as right-aligned bubbles with dark styling
4. THE System SHALL display AI messages as left-aligned bubbles with light styling
5. THE System SHALL display a fixed input bar at the bottom with textarea and send button
6. WHEN a user presses Enter key, THE System SHALL send the message
7. WHEN a user presses Shift+Enter, THE System SHALL insert a new line in the textarea
8. THE System SHALL auto-resize the textarea up to maximum 3 lines

### Requirement 7: Generation Flow

**User Story:** As a user, I want to see progressive feedback during image generation, so that I understand the system is working and can track progress.

#### Acceptance Criteria

1. WHEN a user sends a message, THE System SHALL display a typing indicator with 3 animated dots
2. WHEN generation starts, THE System SHALL display a confirmation bubble stating "Got it! Generating your [outfit]..."
3. THE System SHALL display a Design_Card containing outfit title, occasion, and fabric labels
4. THE Design_Card SHALL display a progress bar showing current image number out of 7 total
5. THE Design_Card SHALL display progress label text indicating which image is being generated
6. WHEN generating Mannequin_View, THE System SHALL display a skeleton placeholder that is replaced with the actual image when complete
7. THE System SHALL display a hint text "Hover to view full size or download"
8. THE System SHALL display a download button for the full mannequin view
9. WHEN Mannequin_View is complete, THE System SHALL display a 3x2 grid of skeleton placeholders for Detail_Shots
10. THE System SHALL replace each Detail_Shot skeleton with the actual image as it arrives
11. WHEN all 7 images are complete, THE System SHALL display a completion bubble with variation suggestion chips

### Requirement 8: Image Interactions

**User Story:** As a user, I want to view and download generated images, so that I can examine details and save designs for later use.

#### Acceptance Criteria

1. WHEN a user hovers over any generated image, THE System SHALL display an overlay with View and Save buttons
2. WHEN a user clicks View button, THE System SHALL open a Lightbox with the image centered on dark overlay
3. THE Lightbox SHALL display the image label at the top
4. THE Lightbox SHALL display Download and Close buttons
5. WHEN a user presses Escape key while Lightbox is open, THE System SHALL close the Lightbox
6. WHEN a user clicks Save button, THE System SHALL download the image as PNG file
7. THE System SHALL name downloaded files using format: outfit name + part name

### Requirement 9: Error Handling

**User Story:** As a user, I want clear error messages when issues occur, so that I can understand and resolve problems.

#### Acceptance Criteria

1. WHEN a user attempts to send a message without an API_Key saved, THE System SHALL display an error bubble stating "Please set your Hugging Face API key first. Click the ⚙️ settings icon in the top right to add it."
2. WHEN a user attempts to send a message without an API_Key saved, THE System SHALL automatically open the Settings_Drawer
3. WHEN the model is loading for the first time, THE System SHALL display message "Model is warming up, first image takes 20-30 seconds..."
4. WHEN a rate limit error occurs, THE System SHALL display message "Too many requests — please wait a moment and try again"
5. WHEN an invalid API_Key is used, THE System SHALL display message "Invalid API key. Please check your token in ⚙️ Settings"
6. WHEN a network error occurs, THE System SHALL display message "Connection failed. Please check your internet and try again"

### Requirement 10: Visual Design System

**User Story:** As a user, I want a beautiful and cohesive visual design, so that the application feels professional and pleasant to use.

#### Acceptance Criteria

1. THE System SHALL use color palette: deep ink (#1a1410), warm cream (#faf6f1), rose accent (#c9847a), gold (#c4a96b)
2. THE System SHALL use Cormorant Garamond font from Google Fonts CDN for headings
3. THE System SHALL use DM Sans font from Google Fonts CDN for body text
4. THE Settings_Drawer SHALL have white background, 360px width, full height, and left-side box shadow
5. THE Settings_Drawer SHALL animate with slide-in effect using CSS transform translateX
6. THE System SHALL display skeleton loaders with shimmer animation in cream tones
7. THE System SHALL display progress bars with gradient from rose-dark to gold
8. THE System SHALL apply subtle hover states to all buttons without harsh borders
9. WHERE viewport width is less than 480px, THE Settings_Drawer SHALL be full width

### Requirement 11: Technical Architecture

**User Story:** As a developer, I want a simple single-file architecture, so that the application is easy to deploy and maintain.

#### Acceptance Criteria

1. THE System SHALL be implemented as a single HTML file containing embedded CSS and vanilla JavaScript
2. THE System SHALL NOT use any JavaScript frameworks or libraries
3. THE System SHALL NOT require a backend server
4. THE System SHALL NOT require build tools or npm
5. THE System SHALL make all API calls directly from browser using fetch to Hugging Face endpoints
6. THE System SHALL persist API_Key in browser localStorage using key "vastra_hf_key"
7. THE System SHALL load fonts from Google Fonts CDN

### Requirement 12: Settings Panel Content Display

**User Story:** As a user, I want comprehensive information in the settings panel, so that I can understand the service and configure it properly.

#### Acceptance Criteria

1. THE Settings_Drawer SHALL display a "Model Info Section" containing model name, provider, cost, and quality information
2. THE Settings_Drawer SHALL display model name as "FLUX.1-schnell"
3. THE Settings_Drawer SHALL display provider as "Hugging Face"
4. THE Settings_Drawer SHALL display cost as "Free — Unlimited"
5. THE Settings_Drawer SHALL display quality as "High"
6. THE Settings_Drawer SHALL display a "How to Get API Key" section with step-by-step instructions
7. THE System SHALL display 4 steps: Sign up at huggingface.co, navigate to Access Tokens, create new token with Read access, copy and paste token
