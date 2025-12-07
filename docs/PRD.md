# Product Requirement Document (PRD): Real-time Translation Display

## 1. Introduction
### 1.1 Product Purpose
The Real-time Translation Display is a web-based application designed to assist presenters in communicating with international audiences. It provides real-time, bi-directional speech-to-text (STT) and translation between Chinese and English, displaying the results clearly for the audience.

### 1.2 Target Audience
- **Primary:** Presenters giving talks to mixed-language audiences.
- **Secondary:** Audience members relying on subtitles to follow the presentation.

## 2. User Scenarios
- **Scenario A (Chinese Speaker):** A presenter speaks in Chinese. The screen displays the original Chinese text and the translated English text in real-time.
- **Scenario B (English Speaker):** A presenter speaks in English. The screen displays the original English text and the translated Chinese text in real-time.
- **Scenario C (Q&A):** Audience asks questions in either language; the system captures and translates for the presenter and other audience members.

## 3. Functional Requirements

### 3.1 Audio Capture & Processing
- **Microphone Input:** Support for default system microphone and external audio sources.
- **VAD (Voice Activity Detection):** Automatically detect when speech starts and stops to segment sentences.
- **Noise Cancellation:** Basic handling of background noise (optional/dependent on API).

### 3.2 Speech-to-Text (STT) & Translation
- **Bi-directional Support:** 
  - Input: Chinese -> Output: Chinese Text + English Translation.
  - Input: English -> Output: English Text + Chinese Translation.
- **Auto-Detection:** The system should automatically detect the spoken language (Chinese or English) and translate to the other.
- **Real-time Streaming:** Text should appear as the user speaks.
- **Latency:** Optimized for speed.

### 3.3 Display Interface
- **Layout:**
  - **Presenter View:** Controls for starting/stopping, selecting languages, adjusting settings.
  - **Audience View:** Clean, high-contrast display of text. Large fonts.
  - **Dual Line Display:** Show source text and translation simultaneously.
- **Visuals:** Modern, premium aesthetic (Dark mode preferred for presentations).
- **Auto-scroll:** The text should auto-scroll to keep the latest speech visible.

### 3.4 Settings & Configuration
- **LLM Configuration:**
  - Support **OpenAI** and **DeepSeek**.
  - Users can input their own API Base URL and Key.
  - Preference for "Free/Open Source" friendly architecture (e.g., compatible definitions).
- **STT Provider:** 
  - Default: **Web Speech API** (Free, Low Latency, Browser-native).
  - Optional: Future support for server-side Whisper.

## 4. Non-Functional Requirements
- **Performance:** Minimal delay between speech and text display.
- **Reliability:** Auto-reconnect if websocket/network fails.
- **Accessibility:** High contrast text, readable font sizes.
- **Compatibility:** Modern browsers (Chrome, Safari, Edge).

## 5. Technical Considerations (Draft)
- **Frontend:** Next.js (React).
- **Styling:** Tailwind CSS.
- **Logic:**
  - **STT:** Web Speech API (`webkitSpeechRecognition`) for capturing text.
  - **Translation:** Send captured text to LLM (OpenAI/DeepSeek) for translation.
  - **Streaming:** Use streaming response from LLM for translation to ensure low latency.
- **State Management:** Zustand.
- **Data Flow:** Mic -> Browser STT -> Text -> LLM API -> Translated Text -> Display.

## 6. Open Questions
- (Resolved) Provider: LLM (OpenAI/DeepSeek).
- (Resolved) Language Mode: Auto-detect supported.
