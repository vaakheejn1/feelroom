from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # API 설정
    api_title: str = "해시태그 추천 API"
    api_version: str = "1.0.0"
    api_description: str = "영화 리뷰를 분석하여 관련 해시태그를 추천하는 API"
    
    # 서버 설정
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # CORS 설정 (프로덕션용)
    allowed_origins: List[str] = ["http://localhost", "http://127.0.0.1"]
    
    # 경로 설정 (EC2 마운트 대응)
    data_path: str = "/app/data"
    model_cache_path: str = "/app/models"
    
    # 모델 설정
    model_name: str = "snunlp/KR-SBERT-V40K-klueNLI-augSTS"
    vector_file_name: str = "hashtag_vectors.pkl"
    keyword_embeddings_file: str = "keyword_embeddings_labse.pkl"
    
    # 추천 설정
    default_hashtag_count: int = 10
    max_hashtag_count: int = 20
    min_similarity_threshold: float = 0.3
    default_max_content_length: int = 1000
    
    # 전체 파일 경로 속성
    @property
    def vector_file_path(self) -> str:
        return os.path.join(self.data_path, self.vector_file_name)
    
    @property
    def keyword_embeddings_path(self) -> str:
        return os.path.join(self.data_path, self.keyword_embeddings_file)
    
    # 환경별 설정
    @property
    def is_development(self) -> bool:
        return self.debug
    
    @property 
    def is_production(self) -> bool:
        return not self.debug
    
    class Config:
        env_file = ".env"
        # 환경변수에서 리스트 파싱
        env_nested_delimiter = "__"
        
        # 환경변수 예시:
        # ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
        # DATA_PATH=/custom/data/path
        # MODEL_CACHE_PATH=/custom/model/path
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == 'allowed_origins':
                return [x.strip() for x in raw_val.split(',')]
            return cls.json_loads(raw_val)

settings = Settings()

# 환경별 로깅 설정
def get_log_config():
    """환경에 따른 로깅 설정"""
    if settings.is_production:
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        }
    else:
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(levelname)s: %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default", 
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "DEBUG",
                "handlers": ["default"],
            },
        }