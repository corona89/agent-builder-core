# Agent Builder Core 🚀

Agent Builder Core는 로컬 LLM(DeepSeek)과 클라우드 LLM(Gemini)을 결합하여 나만의 AI 에이전트를 시뮬레이션하고 구축할 수 있는 오픈소스 플랫폼입니다. 특히 회의록 작성 및 실시간 음성 인식을 위해 최적화된 기능을 제공합니다.

## ✨ 주요 기능

### 1. 🎙️ 실시간 Whisper 스트리밍 (STT)
- **로컬 기반 음성 인식**: `faster-whisper` 모델을 사용하여 개인정보 유출 걱정 없이 로컬 환경에서 음성을 텍스트로 변환합니다.
- **3초 간격 청크 스트리밍**: 사용자의 음성을 3초마다 청크 단위로 서버에 전송하여 실시간성을 확보했습니다.
- **FFmpeg 전처리**: 브라우저의 WebM 데이터를 Whisper가 인식하기 가장 좋은 16k WAV 포맷으로 실시간 인코딩합니다.

### 2. 🤖 하이브리드 지능형 에이전트
- **LLM 선택**: Gemini 3 Flash(클라우드)와 DeepSeek R1 8B(로컬)를 자유롭게 선택하여 에이전트 성능을 시뮬레이션합니다.
- **시스템 페르소나 설계**: 에이전트의 작동 방식과 성격을 직접 정의할 수 있는 시스템 레이어를 제공합니다.

### 3. 📜 고도화된 플레이그라운드 UI
- **실시간 추적 스택**: 에이전트와의 모든 대화 내용을 바이너리 노드 형태로 추적합니다.
- **자동 스크롤 (Smooth Scroll)**: 긴 회의나 대화 중에도 최신 메시지를 놓치지 않도록 실시간 하단 스크롤 기능이 적용되었습니다.
- **원클릭 요약 기능**: 'Meeting' 타입의 에이전트 시뮬레이션 시, 누적된 대화 내용을 바탕으로 핵심 안건을 자동 요약합니다.

## 🛠️ 기술 스택

- **Frontend**: Next.js 15+, Tailwind CSS, Lucide React
- **Backend (API)**: FastAPI (Python 3.11)
- **Speech Engine**: Faster-Whisper, FFmpeg
- **Container**: Docker, Docker Compose
- **Database**: SQLite (SQLAlchemy)

## 🚀 빠른 시작 가이드 (Local Whisper)

1. **Docker 컨테이너 실행**
   ```bash
   docker compose -f docker-compose.whisper.yml up -d
   ```

2. **서버 접속 확인**
   - API 서버: `http://localhost:8000`
   - STT 서버: `http://localhost:8003`

3. **플레이그라운드 사용**
   - 플레이그라운드 오른쪽 아래의 `WHISPER: OFF` 버튼을 눌러 `ON`으로 변경합니다.
   - 마이크 아이콘이 빨간색으로 깜빡이면 실시간 음성 인식이 시작됩니다. 

## 📝 최근 업데이트 (2026-02-08)
- [Add] 실시간 리액트 자동 스크롤 기능 도입
- [Add] Whisper 3초 청크 스트리밍 전송 로직 구현
- [Fix] FFmpeg 전처리 후 음성 짤림 현상(VAD 파라미터) 튜닝
- [Fix] 프론트엔드 네트워크 통신(Fetch) 안정성 보강

---
Developed by **strontium00 / Lion 비서** 🐌
