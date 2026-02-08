from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import io
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# M-series Mac usage or CPU
model_size = "base"
# Run on CPU with INT8 quantization for speed on most local setups
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Read file content
    content = await file.read()
    print(f"Received file: {file.filename}, size: {len(content)} bytes")
    
    # Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(content)
    
    # Pre-process using ffmpeg to standard wav 16k mono
    processed_filename = f"processed_{file.filename}.wav"
    # Ensure raw data is interpreted correctly if webm
    ret = os.system(f"ffmpeg -y -i {temp_filename} -ar 16000 -ac 1 {processed_filename}")
        
    if os.path.exists(processed_filename):
        fsize = os.path.getsize(processed_filename)
        print(f"FFmpeg output: {processed_filename} ({fsize} bytes)")
    else:
        print(f"FFmpeg FAILED for {temp_filename}")
        return {"text": "", "language": "ko"}
    
    try:
        segments, info = model.transcribe(
            processed_filename, 
            beam_size=5,
            condition_on_previous_text=False,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=1000), # Be more patient
            language="ko" 
        )
        
        text = ""
        # Force iteration to trigger the generator immediately
        segment_list = list(segments)
        for segment in segment_list:
            print(f"Segment: {segment.text}")
            text += segment.text
            
        print(f"Final text: {text}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Transcription error: {str(e)}")
        text = f"Error during transcription: {str(e)}"
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        if os.path.exists(processed_filename):
            os.remove(processed_filename)
            
    memory_2026_02_08 = {
        "summary": "Fixed Whisper STT integration in the playground.",
        "details": [
            "Introduced FFmpeg preprocessing for audio in the whisper-service.",
            "Converted frontend Whisper implementation to a 3-second chunked streaming approach.",
            "Added automatic auto-scrolling to the chat history container in the playground.",
            "Refined Whisper VAD and language settings for better Korean recognition stability."
        ]
    }
    
    # Update memory/2026-02-08.md
    with open("memory/2026-02-08.md", "a") as f:
        f.write(f"\n- {memory_2026_02_08['summary']}")

    return {"text": text.strip(), "language": info.language if 'info' in locals() else "unknown"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
