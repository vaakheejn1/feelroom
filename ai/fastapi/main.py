from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging
import sys
import os
from typing import List
import httpx

from app.services.hashtag_service import HashtagService
from app.services.keyword_search_service import KeywordSearchService
from app.models.request_models import HashtagRequest, HashtagResponse, KeywordSearchRequest, KeywordSearchResponse, UserActivity, NewUserRequest
from app.core.config import settings

MOVIE_SERVER_URL = "https://1e0ee75ac5ae.ngrok-free.app"

# 환경변수 설정
os.environ['DATA_PATH'] = settings.data_path
os.environ['TRANSFORMERS_CACHE'] = settings.model_cache_path
os.environ['HF_HOME'] = settings.model_cache_path

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 전역 서비스 인스턴스
hashtag_service = None
keyword_search_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    global hashtag_service, keyword_search_service
    
    try:
        # 디렉토리 존재 확인
        os.makedirs(settings.data_path, exist_ok=True)
        os.makedirs(settings.model_cache_path, exist_ok=True)
        
        # 해시태그 추천 서비스 초기화
        logger.info("🚀 해시태그 추천 서비스 초기화 중...")
        hashtag_service = HashtagService()
        
        if not hashtag_service.initialize():
            logger.error("❌ 해시태그 벡터 파일 로드 실패")
            raise RuntimeError("해시태그 벡터 파일을 로드할 수 없습니다.")
        
        logger.info("✅ 해시태그 서비스 초기화 완료!")
        logger.info(f"📊 로드된 해시태그 수: {len(hashtag_service.hashtag_list)}")
        
        # 키워드 검색 서비스 초기화
        logger.info("🔍 키워드 검색 서비스 초기화 중...")
        keyword_search_service = KeywordSearchService()
        
        if not keyword_search_service.initialize():
            logger.warning("⚠️ 키워드 검색 서비스 초기화 실패 - 검색 기능은 비활성화됩니다")
            keyword_search_service = None
        else:
            logger.info("✅ 키워드 검색 서비스 초기화 완료!")
        
    except Exception as e:
        logger.error(f"❌ 서비스 초기화 실패: {str(e)}")
        sys.exit(1)
    
    yield
    
    # 종료시 정리
    logger.info("🔄 서비스 종료 중...")

# FastAPI 앱 생성
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,  # 프로덕션에서는 문서 비활성화 옵션
    redoc_url="/redoc" if settings.debug else None
)

# CORS 설정 (환경에 따라 다르게)
allowed_origins = ["*"] if settings.debug else settings.allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # 필요한 메소드만
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """루트 엔드포인트 - 기본 정보"""
    return {
        "message": "해시태그 추천 API 서버가 정상 작동 중입니다.",
        "version": settings.api_version,
        "status": "healthy",
        "endpoints": {
            "health": "/health",
            "hashtag_recommend": "/api/v1/reviews/tags/recommend", 
            "keyword_search": "/api/v1/keywordSearch",
            "stats": "/stats",
            "docs": "/docs" if settings.debug else "disabled"
        }
    }

@app.get("/health")
async def health_check():
    """상세 헬스 체크"""
    global hashtag_service, keyword_search_service
    
    hashtag_healthy = hashtag_service is not None and hashtag_service.is_ready()
    keyword_healthy = keyword_search_service is not None and keyword_search_service.is_ready()
    hashtag_count = len(hashtag_service.hashtag_list) if hashtag_healthy else 0
    keyword_count = len(keyword_search_service.keywords) if keyword_healthy else 0
    
    status = {
        "status": "healthy" if hashtag_healthy else "partial" if keyword_healthy else "unhealthy",
        "services": {
            "hashtag_recommendation": {
                "ready": hashtag_healthy,
                "count": hashtag_count,
                "model": settings.model_name
            },
            "keyword_search": {
                "ready": keyword_healthy,
                "count": keyword_count,
                "model": "LaBSE"
            }
        },
        "version": settings.api_version
    }
    
    if not hashtag_healthy:
        logger.warning("⚠️ 헬스 체크 - 해시태그 서비스가 준비되지 않음")
    if not keyword_healthy:
        logger.warning("⚠️ 헬스 체크 - 키워드 검색 서비스가 준비되지 않음")
    
    return status

@app.post("/api/v1/reviews/tags/recommend", response_model=HashtagResponse)
async def recommend_hashtags(request: HashtagRequest):
    """해시태그 추천 API"""
    global hashtag_service
    
    # 서비스 준비 상태 확인
    if not hashtag_service or not hashtag_service.is_ready():
        logger.error("❌ 해시태그 추천 요청 실패 - 서비스가 준비되지 않음")
        raise HTTPException(
            status_code=503, 
            detail="해시태그 추천 서비스가 준비되지 않았습니다."
        )
    
    try:
        logger.info(f"📝 해시태그 추천 요청 - 제목: '{request.title[:50]}...', 개수: {request.count}")
        
        # 해시태그 추천 (듀얼, 하이브리드, 또는 기존 방식)
        if request.use_dual:
            recommendations = hashtag_service.recommend_hashtags_dual(
                title=request.title,
                content=request.content,
                count=request.count,
                max_content_length=request.max_content_length
            )
        elif request.use_hybrid:
            recommendations = hashtag_service.recommend_hashtags_hybrid(
                title=request.title,
                content=request.content,
                count=request.count,
                max_content_length=request.max_content_length
            )
        else:
            recommendations = hashtag_service.recommend_hashtags(
                title=request.title,
                content=request.content,
                count=request.count,
                max_content_length=request.max_content_length
            )
        
        # 응답 데이터 구성
        hashtags = []
        for hashtag_id, hashtag_text, score, source in recommendations:
            hashtags.append({
                "hashtag_id": hashtag_id,
                "hashtag": hashtag_text,
                "similarity_score": round(score, 4),
                "source": source
            })
        
        logger.info(f"✅ 해시태그 추천 완료 - {len(hashtags)}개 반환")
        
        return HashtagResponse(
            success=True,
            hashtags=hashtags,
            total_count=len(hashtags),
            message="해시태그 추천이 완료되었습니다."
        )
        
    except Exception as e:
        logger.error(f"❌ 해시태그 추천 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"해시태그 추천 중 오류가 발생했습니다: {str(e)}"
        )

@app.post("/api/v1/keywordSearch", response_model=KeywordSearchResponse)
async def search_keywords(request: KeywordSearchRequest):
    """키워드 검색 API"""
    global keyword_search_service
    
    # 서비스 준비 상태 확인
    if not keyword_search_service or not keyword_search_service.is_ready():
        logger.error("❌ 키워드 검색 요청 실패 - 서비스가 준비되지 않음")
        raise HTTPException(
            status_code=503,
            detail="키워드 검색 서비스가 준비되지 않았습니다."
        )
    
    try:
        logger.info(f"🔍 키워드 검색 요청 - 검색어: '{request.query}', 개수: {request.top_k}")
        
        # 키워드 검색
        results = keyword_search_service.search(
            korean_query=request.query,
            top_k=request.top_k
        )
        
        # 응답 데이터 구성 (Spring Boot에서 받을 keywordId)
        keywords = []
        for result in results:
            keywords.append({
                "keywordId": result["id"],  # Spring Boot에서 받을 keywordId
                "score": round(result["score"], 4),
                "rank": result["rank"]
            })
        
        logger.info(f"✅ 키워드 검색 완료 - {len(keywords)}개 반환")
        
        return KeywordSearchResponse(
            success=True,
            query=request.query,
            results=keywords,
            count=len(keywords),
            message="키워드 검색이 완료되었습니다."
        )
        
    except Exception as e:
        logger.error(f"❌ 키워드 검색 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"키워드 검색 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/stats")
async def get_stats():
    """서비스 통계 정보"""
    global hashtag_service, keyword_search_service
    
    hashtag_ready = hashtag_service and hashtag_service.is_ready()
    keyword_ready = keyword_search_service and keyword_search_service.is_ready()
    
    if not hashtag_ready and not keyword_ready:
        raise HTTPException(
            status_code=503,
            detail="모든 서비스가 준비되지 않았습니다."
        )
    
    stats = {
        "services": {
            "hashtag_recommendation": {
                "ready": hashtag_ready,
                "total_hashtags": len(hashtag_service.hashtag_list) if hashtag_ready else 0,
                "model_name": hashtag_service.model_name if hashtag_ready else "N/A",
                "vector_dimension": hashtag_service.vector_matrix.shape[1] if hashtag_ready and hashtag_service.vector_matrix is not None else 0
            },
            "keyword_search": {
                "ready": keyword_ready,
                "total_keywords": len(keyword_search_service.keywords) if keyword_ready else 0,
                "model_name": "LaBSE",
                "embedding_dimension": keyword_search_service.embeddings.shape[1] if keyword_ready and keyword_search_service.embeddings is not None else 0
            }
        },
        "service_info": {
            "version": settings.api_version,
            "debug_mode": settings.debug,
            "default_hashtag_count": settings.default_hashtag_count,
            "max_hashtag_count": settings.max_hashtag_count,
            "min_similarity_threshold": settings.min_similarity_threshold
        }
    }
    
    logger.info("📊 통계 정보 요청 처리 완료")
    return stats

@app.post("/api/v1/recommendations/user")
async def proxy_user_recommendation(activity: UserActivity):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{MOVIE_SERVER_URL}/recommendations/user", json=activity.dict())
    return response.json()

@app.post("/api/v1/recommendations/new_user")
async def proxy_new_user_recommendation(request: NewUserRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{MOVIE_SERVER_URL}/recommendations/new_user", json=request.dict())
    return response.json()
 
@app.post("/api/v1/recommendations/feed")
async def proxy_feed_recommendation(activity: UserActivity):  # ✅ UserActivity로 변경!
    """리뷰 피드 추천 프록시 API"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MOVIE_SERVER_URL}/recommendations/feed", 
            json=activity.dict()
            #headers={"ngrok-skip-browser-warning": "true"}
        )
    return response.json()

# 개발 환경에서만 사용할 추가 엔드포인트
if settings.debug:
    @app.get("/debug/config")
    async def debug_config():
        """디버그용 - 설정 정보 확인"""
        return {
            "debug": settings.debug,
            "model_name": settings.model_name,
            "vector_file_path": settings.vector_file_path,
            "allowed_origins": settings.allowed_origins if hasattr(settings, 'allowed_origins') else ["*"]
        }

# 에러 핸들러 추가
@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    logger.error(f"❌ 내부 서버 오류: {str(exc)}")
    return {
        "error": "내부 서버 오류가 발생했습니다.",
        "detail": str(exc) if settings.debug else "관리자에게 문의하세요."
    }

@app.exception_handler(503)
async def service_unavailable_handler(request, exc):
    logger.error(f"❌ 서비스 사용 불가: {str(exc)}")
    return {
        "error": "서비스가 일시적으로 사용할 수 없습니다.",
        "detail": str(exc)
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )