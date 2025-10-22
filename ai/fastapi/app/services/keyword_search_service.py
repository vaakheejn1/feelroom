"""
키워드 검색 서비스 (LaBSE 모델)
"""
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import logging
import os

logger = logging.getLogger(__name__)

class KeywordSearchService:
    def __init__(self):
        self.model = None
        self.keywords = None
        self.ids = None
        self.embeddings = None
        
        # 환경변수에서 경로 가져오기
        self.pkl_file_path = os.getenv('DATA_PATH', '/app/data') + '/keyword_embeddings_labse.pkl'
        self.model_cache_dir = os.getenv('TRANSFORMERS_CACHE', '/app/models')
        
        self._ready = False
        
    def initialize(self):
        """서비스 초기화"""
        try:
            logger.info("🚀 LaBSE 모델 로딩 중...")
            self.model = SentenceTransformer('LaBSE', cache_folder=self.model_cache_dir)
            
            logger.info(f"📁 PKL 파일 로딩: {self.pkl_file_path}")
            if not os.path.exists(self.pkl_file_path):
                logger.error(f"❌ PKL 파일을 찾을 수 없습니다: {self.pkl_file_path}")
                return False
                
            with open(self.pkl_file_path, 'rb') as f:
                data = pickle.load(f)
            
            self.keywords = data['keywords']
            self.ids = data['ids']
            self.embeddings = data['embeddings']
            
            logger.info(f"✅ 키워드 검색 서비스 초기화 완료: {len(self.keywords)}개 키워드")
            self._ready = True
            return True
            
        except FileNotFoundError:
            logger.error(f"❌ PKL 파일을 찾을 수 없습니다: {self.pkl_file_path}")
            return False
        except Exception as e:
            logger.error(f"❌ 초기화 오류: {str(e)}")
            return False
    
    def is_ready(self):
        """서비스 준비 상태 확인"""
        return self._ready and self.model is not None and self.keywords is not None
    
    def search(self, korean_query, top_k=5):
        """한국어 검색어로 유사한 키워드 검색"""
        if not self.is_ready():
            raise ValueError("서비스가 초기화되지 않았습니다.")
        
        try:
            # 한국어 검색어 벡터화
            query_embedding = self.model.encode([korean_query])
            
            # 코사인 유사도 계산
            similarities = cosine_similarity(query_embedding, self.embeddings)[0]
            
            # 상위 k개 인덱스
            top_indices = similarities.argsort()[-top_k:][::-1]
            
            # 결과 반환
            results = []
            for idx in top_indices:
                results.append({
                    'keyword': self.keywords[idx],
                    'id': self.ids[idx],
                    'score': float(similarities[idx]),
                    'rank': len(results) + 1
                })
            
            logger.info(f"🔍 키워드 검색 완료: '{korean_query}' -> {len(results)}개 결과")
            return results
            
        except Exception as e:
            logger.error(f"❌ 검색 오류: {str(e)}")
            raise
    
    def get_stats(self):
        """서비스 통계 정보"""
        return {
            'service': 'keyword-search',
            'model_name': 'LaBSE',
            'ready': self.is_ready(),
            'keyword_count': len(self.keywords) if self.keywords else 0,
            'embedding_dimension': self.embeddings.shape[1] if self.embeddings is not None else 0
        }