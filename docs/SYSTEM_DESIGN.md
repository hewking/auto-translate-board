# System Design: Real-time Translation Display

## 1. System Overview
The system is a client-side heavy web application built with **Next.js**. It leverages browser-native capabilities for Speech-to-Text (STT) to minimize latency and cost, and uses external Large Language Models (LLM) for high-quality, context-aware translation.

### Core Philosophy
- **Speed First**: Visual feedback must be immediate.
- **Privacy/Local**: Audio is processed locally (Web Speech API). Only text is sent to the LLM.
- **Simplicity**: No complex backend; the browser talks directly to APIs.

### 1.1 Architecture Rationale (Why No Backend?)
We have chosen a **Client-Side / Serverless** architecture for the following reasons:
1.  **Latency**: Direct connection from `Browser -> LLM` is faster than `Browser -> Our Backend -> LLM -> Our Backend -> Browser`.
2.  **STT Performance**: Using the browser's native `Web Speech API` eliminates the need to stream heavy audio data over the network, resulting in zero-network-latency for transcription.
3.  **Cost & Maintenance**: No server costs or complex infrastructure to maintain.
4.  **Privacy**: Users' API keys are stored locally in their browser. We do not store or process their credentials or conversation data on a central server.

*Note: A backend would only be necessary if we needed to proxy payments, hide a global API key for a SaaS model, or perform heavy custom audio processing not possible in the browser.*

## 2. Architecture Diagram

```mermaid
graph TD
    User[User / Speaker] -->|Audio| Mic[Microphone Input]
    Mic -->|Audio Stream| BrowserSTT[Web Speech API]
    
    subgraph Client Application [Next.js App]
        BrowserSTT -->|Events: interim/final| useSTT[Custom Hook: useSTT]
        useSTT -->|Update| Store[Zustand Store]
        
        Store -->|State Change| UI_Board[Translation Board UI]
        Store -->|Text Segment| TranslationService[LLM Client]
        
        TranslationService -->|API Call (Stream)| LLM_API[OpenAI / DeepSeek API]
        LLM_API -->|Stream Chunks| TranslationService
        TranslationService -->|Update Translation| Store
    end
    
    UI_Board -->|Render| Display[Screen Display]
```

## 3. Component Design

### 3.1 Data Layer (Zustand Store)
We use **Zustand** for global state management to ensure all components (Settings, Board, Logic) stay in sync without prop drilling.

**Store Structure:**
- **Settings slice**:
  - `apiKey`: String (Persisted)
  - `baseUrl`: String (Persisted, default OpenAI)
  - `targetLang`: Enum ('en', 'zh')
- **Transcript slice**:
  - `segments`: Array<{ id, text, translation, isFinal }>
  - `currentInterim`: String (Live input)
  - `currentTranslation`: String (Live interim translation)

### 3.2 Audio & Recognition Layer (`useSTT` Hook)
Wraps `window.webkitSpeechRecognition`.
- **Responsibilities**:
  - Manage the recognition lifecycle (start, stop, auto-restart).
  - Handle browser quirks (e.g., silence timeouts).
  - Normalize events (interim vs final results).
- **Output**: Direct updates to the Zustand store.

### 3.3 Translation Layer (`LLM Client`)
A stateless utility function that handles the API communication.
- **Input**: Source text string.
- **Mechanism**: 
  - Construct prompt: *"You are a simultaneous interpreter..."*
  - auto-detect logic is embedded in the prompt instruction.
  - Call `POST /chat/completions` with `stream: true`.
- **Output**: Async Generator yielding chunks of text.

### 3.4 UI Layer
- **SettingsModal**: Configuration interface.
- **TranslationBoard**:
  - **Auto-scroll**: Keeps the "Active" items in view.
  - **Styling**: Large typography, dark mode, animation for "liveness".

## 4. Workflows

### 4.1 Speech-to-Text Flow
1. User speaks.
2. Web Speech API detects sound.
3. `onresult` event fires with `interim` results.
4. UI updates immediately to show "hearing" status.
5. User pauses/finishes sentence.
6. `onresult` fires with `isFinal: true`.
7. Text is committed to `segments` list.
8. **Trigger**: The finalized text is immediately sent to the Translation Service.

### 4.2 Translation Flow
1. System receives `final` text segment.
2. Calls `translateTextStream(text)`.
3. As chunks arrive from LLM:
   - Update `currentTranslation` for that specific segment.
   - UI re-renders characters one by one (typing effect).
4. When stream ends, validity is confirmed.

## 5. Technology Choices
- **Frontend Framework**: Next.js 14 (App Router) - Robust, industry standard.
- **Styling**: Tailwind CSS + Lucide Icons - Rapid UI development, easy dark mode.
- **State**: Zustand - Lighter than Redux, easier than Context API for frequent updates.
- **Build Tool**: Bun/Node (Standard).

## 6. Security & Privacy
- **API Keys**: Stored in `localStorage` only. Never sent to our server (we have no server).
- **Audio**: Never leaves the browser (processed by OS/Browser engine).
- **Text**: Sent only to the user-configured LLM provider.
