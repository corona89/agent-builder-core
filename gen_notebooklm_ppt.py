from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

def create_notebooklm_ppt():
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(5.625) # 16:9

    # Colors
    BLUE_SKY = RGBColor(0, 112, 192)
    DARK_GRAY = RGBColor(64, 64, 64)
    TEXT_BLACK = RGBColor(0, 0, 0)

    def add_slide(title_text):
        slide_layout = prs.slide_layouts[5] # Blank with title
        slide = prs.slides.add_slide(slide_layout)
        title = slide.shapes.title
        title.text = title_text
        title.text_frame.paragraphs[0].font.size = Pt(28)
        title.text_frame.paragraphs[0].font.bold = True
        title.text_frame.paragraphs[0].font.color.rgb = BLUE_SKY
        title.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
        return slide

    def add_bullet(slide, text, level=0, size=18):
        body_shape = slide.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(9), Inches(4))
        tf = body_shape.text_frame
        tf.word_wrap = True
        for line in text:
            p = tf.add_paragraph()
            p.text = line['txt']
            p.level = line['lvl']
            p.font.size = Pt(size - (line['lvl'] * 2))
            p.font.color.rgb = DARK_GRAY

    # Slide 1: Title
    slide1 = prs.slides.add_slide(prs.slide_layouts[0])
    title = slide1.shapes.title
    title.text = "Agent Builder ( AI:ON-U )"
    subtitle = slide1.placeholders[1]
    subtitle.text = "2026-02-02\n핵심 고도화 전략 및 실행 계획"

    # Slide 2: 핵심 포인트
    slide2 = add_slide("핵심 포인트")
    add_bullet(slide2, [
        {"lvl": 0, "txt": "Agent Ops의 창발적 가속화를 위한 AI Agent Builder 고도화 전략 수립 체계 운영"},
        {"lvl": 0, "txt": "AI Agent Builder 신기술 트렌드와 경쟁사 분석을 통해 기술 경쟁력 강화"},
        {"lvl": 0, "txt": "현장 사업 중심의 기업용 특화 기능을 보완하여 AX 사업 경쟁력 확보"}
    ])

    # Slide 3: 26년 고도화 전략 수립 체계
    slide3 = add_slide("26개년 고도화 전략 수립 체계")
    add_bullet(slide3, [
        {"lvl": 0, "txt": "기술 경쟁력 강화 전략 과제(안)"},
        {"lvl": 1, "txt": "온톨로지 기반 지식 등록 관리 도구 / 멀티 모달 I/F 확장"},
        {"lvl": 1, "txt": "에이전트 표준 인터페이스 연동 지원 / 커스텀 에이전트 생성 자동화"},
        {"lvl": 0, "txt": "사업 경쟁력 강화 전략 과제(안)"},
        {"lvl": 1, "txt": "대규모 트래픽 지원 도구 / 관리자용 LLM 모델 등록 운영 관리"},
        {"lvl": 1, "txt": "에이전트 평가 / 가드레일 / 거버넌스 / 보안성 강화(인증/배포)"}
    ])

    # Slide 4: 26년 고도화 실행 계획
    slide4 = add_slide("26개년 고도화 실행 계획")
    add_bullet(slide4, [
        {"lvl": 0, "txt": "사업 경쟁력 강화"},
        {"lvl": 1, "txt": "기업용 보안성 강화 (권한 인증 옵션, OTP 로그인 인증 등)"},
        {"lvl": 1, "txt": "운영 안정성 강화 (단말 가드레일, 거버넌스, 대규모 환경 제공)"},
        {"lvl": 0, "txt": "기술 경쟁력 강화"},
        {"lvl": 1, "txt": "사용 편의성 (자연어 기반 워크플로우 제작 자동화)"},
        {"lvl": 1, "txt": "I/F 확장 (멀티모달 오디오/영상, 표준 인터페이스 A2A/OpenAI)"}
    ])

    # Slide 5: 개발 과업 - 사업경쟁력 강화
    slide5 = add_slide("개발 과업: 사업경쟁력 강화")
    add_bullet(slide5, [
        {"lvl": 0, "txt": "AI 기업 데이터 통합 서비스 (RAG 고도화, 문서/메타데이터, 임베딩 추가)"},
        {"lvl": 0, "txt": "데이터 안전을 위한 보안 강화 (가드레일 서비스, 인증 서비스 고도화)"},
        {"lvl": 0, "txt": "에이전트 개발 가속화 (워크플로우 자동화, 플래닝 에이전트, 모델 관리)"}
    ], size=16)

    # Slide 6: 개발 과업 - 기술경쟁력 강화
    slide6 = add_slide("개발 과업: 기술경쟁력 강화")
    add_bullet(slide6, [
        {"lvl": 0, "txt": "사내 온톨로지 데이터 관리 (Graph RAG 도입, 데이터 구조도 구현)"},
        {"lvl": 0, "txt": "에이전트 허브 전환 (A2A 연동, 멀티모달 IN/OUT 도입)"},
        {"lvl": 0, "txt": "운용 효율화 (휴먼 인 더 루프 기능, MCP 배포 기능 도입)"}
    ], size=16)

    # Save
    path = "strontium-webpage/backend/uploads/AION_U_NotebookLM_Slides.pptx"
    prs.save(path)
    print(path)

create_notebooklm_ppt()
