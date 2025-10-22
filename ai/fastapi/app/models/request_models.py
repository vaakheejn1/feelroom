from pydantic import BaseModel, Field
from typing import List, Optional

# 해시태그 추천 요청/응답 모델
class HashtagRequest(BaseModel):
    """해시태그 추천 요청 모델"""
    title: str = Field(..., description="영화 제목")
    content: Optional[str] = Field(None, description="영화 내용/리뷰 (선택사항)")
    count: int = Field(5, description="추천할 해시태그 개수", ge=1, le=20)
    max_content_length: Optional[int] = Field(500, description="내용 최대 길이")
    use_dual: bool = Field(default=True, description="듀얼 방식 사용 여부 (embeddings 1위 키워드 + vectors 상위 5개)")
    use_hybrid: bool = Field(default=False, description="하이브리드 방식 사용 여부 (기존 방식)")

class HashtagItem(BaseModel):
    """개별 해시태그 항목"""
    hashtag_id: int = Field(..., description="해시태그 ID")
    hashtag: str = Field(..., description="해시태그")
    similarity_score: float = Field(..., description="유사도 점수")
    source: str = Field(..., description="추천 소스 (title/content)")

class HashtagResponse(BaseModel):
    """해시태그 추천 응답 모델"""
    success: bool = Field(..., description="성공 여부")
    hashtags: List[HashtagItem] = Field(..., description="추천된 해시태그 목록")
    total_count: int = Field(..., description="반환된 해시태그 개수")
    message: str = Field(..., description="응답 메시지")

# 키워드 검색 요청/응답 모델
class KeywordSearchRequest(BaseModel):
    """키워드 검색 요청 모델"""
    query: str = Field(..., description="검색 쿼리")
    top_k: int = Field(10, description="반환할 키워드 개수", ge=1, le=50)

class KeywordResult(BaseModel):
    """개별 키워드 검색 결과"""
    keywordId: int = Field(..., description="키워드 ID")  # Spring Boot에서 받을 keywordId
    score: float = Field(..., description="유사도 점수")
    rank: int = Field(..., description="순위")

class KeywordSearchResponse(BaseModel):
    """키워드 검색 응답 모델"""
    success: bool = Field(..., description="성공 여부")
    query: str = Field(..., description="검색 쿼리")
    results: List[KeywordResult] = Field(..., description="검색 결과 목록")
    count: int = Field(..., description="반환된 결과 개수")
    message: str = Field(..., description="응답 메시지")

class UserActivity(BaseModel):
    userId: int
    reviewedMovieIds: List[int]
    ratings: List[float]
    likedReviewIds: List[str]
    likedMovieIds: List[int]

class NewUserRequest(BaseModel):
    liked_tmdb_ids: List[int]