import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple
import re

class HashtagService:
    def __init__(self, model_name: str = "snunlp/KR-SBERT-V40K-klueNLI-augSTS"):
        self.model_name = model_name
        self.model = None
        self.hashtag_data = {}  # {id: {"text": str, "vector": array}}
        self.hashtag_list = []  # 해시태그 텍스트 리스트
        self.hashtag_ids = []   # 해시태그 ID 리스트  
        self.vector_matrix = None
        self._ready = False
        
        # 환경변수로 경로 설정
        self.data_path = os.getenv('DATA_PATH', '/app/data')
        self.model_cache_path = os.getenv('TRANSFORMERS_CACHE', '/app/models')
        
        # hashtag_embeddings.pkl 관련 데이터
        self.embeddings_data = None
        self.key_embeddings = None  # 키워드별 대표 임베딩
        self.key_hashtag_groups = {}  # {parent_key_id: [hashtag_info_list]}
    
    def initialize(self) -> bool:
        try:
            print(f"모델 로딩 중: {self.model_name}")
            # 캐시 디렉토리 설정
            self.model = SentenceTransformer(self.model_name, cache_folder=self.model_cache_path)
            
            # 기존 해시태그 벡터 파일 로드
            vector_file = self.data_path + '/hashtag_vectors.pkl'
            
            if not os.path.exists(vector_file):
                print(f"벡터 파일을 찾을 수 없습니다: {vector_file}")
                return False
            
            with open(vector_file, 'rb') as f:
                self.hashtag_data = pickle.load(f)
            
            # ID 기반 구조에서 데이터 추출
            self.hashtag_ids = list(self.hashtag_data.keys())
            self.hashtag_list = [self.hashtag_data[id]["text"] for id in self.hashtag_ids]
            self.vector_matrix = np.array([self.hashtag_data[id]["vector"] for id in self.hashtag_ids])
            
            # hashtag_embeddings.pkl 데이터 로드 시도
            self._load_embeddings_data()
            
            self._ready = True
            print(f"해시태그 벡터 로드 완료: {len(self.hashtag_data)}개")
            return True
            
        except Exception as e:
            print(f"초기화 중 오류 발생: {e}")
            return False
    
    def _load_embeddings_data(self):
        """hashtag_embeddings.pkl 데이터를 로드합니다."""
        try:
            embeddings_file = self.data_path + '/hashtag_embeddings.pkl'
            if not os.path.exists(embeddings_file):
                print(f"hashtag_embeddings.pkl 파일이 없습니다: {embeddings_file}")
                return
            
            with open(embeddings_file, 'rb') as f:
                self.embeddings_data = pickle.load(f)
            
            # parent_key_id별로 해시태그 그룹핑
            for i, meta in enumerate(self.embeddings_data['metadata']):
                parent_key_id = meta['parent_key_id']
                if parent_key_id not in self.key_hashtag_groups:
                    self.key_hashtag_groups[parent_key_id] = []
                
                hashtag_info = {
                    'embedding_index': i,
                    'hashtag_id': meta['id'],
                    'hashtag_text': meta['original_text'].replace('#', ''),  # # 제거
                    'sentiment': meta['sentiment'],
                    'embedding': self.embeddings_data['embeddings'][i]
                }
                self.key_hashtag_groups[parent_key_id].append(hashtag_info)
            
            # 각 키워드(parent_key_id)의 대표 임베딩 계산 (평균)
            key_embeddings_list = []
            key_ids = []
            
            for parent_key_id, hashtags in self.key_hashtag_groups.items():
                # 해당 키워드의 모든 해시태그 임베딩 평균
                embeddings = np.array([ht['embedding'] for ht in hashtags])
                avg_embedding = np.mean(embeddings, axis=0)
                
                key_embeddings_list.append(avg_embedding)
                key_ids.append(parent_key_id)
            
            self.key_embeddings = np.array(key_embeddings_list)
            self.key_ids = key_ids
            
            print(f"hashtag_embeddings.pkl 로드 완료:")
            print(f"  - 키워드 수: {len(self.key_hashtag_groups)}")
            print(f"  - 총 해시태그 수: {len(self.embeddings_data['metadata'])}")
            
        except Exception as e:
            print(f"hashtag_embeddings.pkl 로드 실패: {e}")
            # 실패해도 기존 기능은 유지
    
    def is_ready(self) -> bool:
        return self._ready and self.model is not None and len(self.hashtag_list) > 0
    
    def get_hashtag_by_id(self, hashtag_id: int) -> dict:
        """ID로 해시태그 정보 조회"""
        if hashtag_id in self.hashtag_data:
            return {
                "id": hashtag_id,
                "text": self.hashtag_data[hashtag_id]["text"],
                "vector": self.hashtag_data[hashtag_id]["vector"]
            }
        return None
    
    def get_hashtag_text_by_id(self, hashtag_id: int) -> str:
        """ID로 해시태그 텍스트만 조회"""
        if hashtag_id in self.hashtag_data:
            return self.hashtag_data[hashtag_id]["text"]
        return None
    
    def extract_keywords(self, text: str, max_length: int = 500) -> List[str]:
        if len(text) > max_length:
            text = self.smart_text_summary(text, max_length)
        
        korean_pattern = re.compile(r'[가-힣]{2,}')
        words = korean_pattern.findall(text)
        
        stopwords = {'그래서', '그리고', '하지만', '그런데', '그러나', '또한', '그냥', '정말', '진짜', '너무', '아주', '매우', '조금', '좀더', '다시', '또다시', '계속', '항상', '언제나', '모든', '전체', '일부', '어떤', '이런', '저런', '그런'}
        words = [word for word in words if word not in stopwords and len(word) > 1]
        
        seen = set()
        unique_words = []
        for word in words:
            if word not in seen:
                unique_words.append(word)
                seen.add(word)
        
        return unique_words
    
    def smart_text_summary(self, text: str, max_length: int) -> str:
        if len(text) <= max_length:
            return text
            
        sentences = []
        for delimiter in ['. ', '! ', '? ', '.\n', '!\n', '?\n']:
            text = text.replace(delimiter, '|||SPLIT|||')
        
        raw_sentences = [s.strip() for s in text.split('|||SPLIT|||') if s.strip()]
        
        for sentence in raw_sentences:
            if len(sentence) > 100:
                parts = sentence.replace(', ', '|||SUB|||').replace('그리고 ', '|||SUB|||').replace('하지만 ', '|||SUB|||').split('|||SUB|||')
                sentences.extend([p.strip() for p in parts if p.strip()])
            else:
                sentences.append(sentence)
        
        if not sentences:
            return text[:max_length//2] + " " + text[-max_length//2:]
        
        important_sentences = []
        
        if len(sentences) >= 1:
            important_sentences.extend(sentences[:2])
        if len(sentences) >= 3:
            important_sentences.extend(sentences[-2:])
        
        if len(sentences) > 4:
            middle_sentences = sentences[2:-2]
            middle_sentences.sort(key=len, reverse=True)
            important_sentences.extend(middle_sentences[:2])
        
        summary_text = " ".join(important_sentences)
        
        if len(summary_text) > max_length:
            summary_text = summary_text[:max_length] + "..."
            
        return summary_text
    
    def generate_bigrams(self, words: List[str]) -> List[str]:
        bigrams = []
        for i in range(len(words) - 1):
            bigram = f"{words[i]} {words[i+1]}"
            bigrams.append(bigram)
        return bigrams
    
    def search_hashtags_for_query(self, query: str, top_k: int = 3) -> List[Tuple[int, str, float]]:
        if not query.strip():
            return []
            
        query_vector = self.model.encode([query])
        similarities = cosine_similarity(query_vector, self.vector_matrix)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        print(f"[DEBUG] 쿼리: '{query}', 상위 5개 유사도:", end="")
        for idx in top_indices[:5]:
            hashtag_id = self.hashtag_ids[idx]
            hashtag_text = self.hashtag_list[idx]
            similarity = similarities[idx]
            print(f" {hashtag_text}({similarity:.3f})", end="")
            if similarity >= 0.3:
                results.append((hashtag_id, hashtag_text, float(similarity)))
        print(f" -> {len(results)}개 선택")
        
        return results
    
    def recommend_hashtags(self, title: str, content: str, count: int = 10, max_content_length: int = 1000) -> List[Tuple[int, str, float, str]]:
        if not self.is_ready():
            raise RuntimeError("서비스가 초기화되지 않았습니다.")
        
        if len(content) > max_content_length:
            content = self.smart_text_summary(content, max_content_length)
        
        # 내용만 사용 (제목 제외)
        content_words = self.extract_keywords(content)
        bigrams = self.generate_bigrams(content_words)
        
        all_results = []
        seen_hashtags = set()
        
        # 1. 전체 내용 분석 (높은 가중치)
        print(f"[DEBUG] 분석할 내용: {content[:100]}...")
        content_results = self.search_hashtags_for_query(content, top_k=5)
        print(f"[DEBUG] 내용 분석 결과: {len(content_results)}개")
        for hashtag_id, hashtag_text, score in content_results:
            if hashtag_text not in seen_hashtags:
                all_results.append((hashtag_id, hashtag_text, score * 2.0, "내용분석"))
                seen_hashtags.add(hashtag_text)
        
        # 2. 2-gram 분석 (중간 가중치)
        bigram_added = 0
        for bigram in bigrams[:8]:
            if bigram_added >= 4:
                break
            bigram_results = self.search_hashtags_for_query(bigram, top_k=1)
            for hashtag_id, hashtag_text, score in bigram_results:
                if hashtag_text not in seen_hashtags:
                    all_results.append((hashtag_id, hashtag_text, score * 1.5, f"2-gram:{bigram}"))
                    seen_hashtags.add(hashtag_text)
                    bigram_added += 1
                    break
        
        # 3. 개별 단어 분석 (낮은 가중치)
        word_added = 0
        for word in content_words[:10]:
            if word_added >= 3:
                break
            word_results = self.search_hashtags_for_query(word, top_k=1)
            for hashtag_id, hashtag_text, score in word_results:
                if hashtag_text not in seen_hashtags:
                    all_results.append((hashtag_id, hashtag_text, score * 1.0, f"단어:{word}"))
                    seen_hashtags.add(hashtag_text)
                    word_added += 1
                    break
        
        all_results.sort(key=lambda x: -x[2])  # score로 정렬 (인덱스 2)
        return all_results[:count]
    
    def get_top_keyword_hashtags(self, review_text: str) -> List[Tuple[int, str, float, str]]:
        """hashtag_embeddings.pkl에서 1위 키워드의 모든 해시태그를 추천합니다."""
        if not self.embeddings_data or not hasattr(self, 'key_embeddings') or self.key_embeddings is None:
            return []
        
        try:
            # 리뷰 임베딩 생성
            review_embedding = self.model.encode([review_text])
            
            # 키워드와의 유사도 계산
            similarities = cosine_similarity(review_embedding, self.key_embeddings)[0]
            
            # 가장 유사한 키워드 찾기
            top_idx = np.argmax(similarities)
            top_similarity = similarities[top_idx]
            
            if top_similarity < 0.3:  # 임계값 미달
                return []
            
            # 1위 키워드의 parent_key_id 찾기
            top_key_id = self.key_ids[top_idx]
            
            print(f"[DEBUG] 1위 키워드 ID: {top_key_id} (유사도: {top_similarity:.3f})")
            
            # 해당 키워드의 모든 해시태그 가져오기
            hashtags = self.key_hashtag_groups.get(top_key_id, [])
            
            result = []
            for i, hashtag_info in enumerate(hashtags):
                hashtag_id = hashtag_info['hashtag_id']
                hashtag_text = hashtag_info['hashtag_text']
                
                # 점수는 기본 유사도에 순위별 가중치 적용
                score = top_similarity * (1.0 - i * 0.05)  # 순서대로 점수 약간 감소
                
                result.append((hashtag_id, hashtag_text, float(score), f"1위키워드:{top_key_id}"))
            
            print(f"[DEBUG] 1위 키워드에서 {len(result)}개 해시태그 추출")
            return result
            
        except Exception as e:
            print(f"[ERROR] 1위 키워드 해시태그 추출 실패: {e}")
        
        return []
    
    def get_direct_hashtags(self, review_text: str, top_k: int = 5) -> List[Tuple[int, str, float, str]]:
        """hashtag_vectors.pkl에서 직접 상위 5개 해시태그를 추천합니다."""
        if not self.is_ready():
            return []
        
        try:
            # 리뷰 임베딩 생성
            review_embedding = self.model.encode([review_text])
            
            # hashtag_vectors와의 유사도 계산
            similarities = cosine_similarity(review_embedding, self.vector_matrix)[0]
            
            # 상위 top_k개 찾기
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            result = []
            for idx in top_indices:
                hashtag_id = self.hashtag_ids[idx]
                hashtag_text = self.hashtag_list[idx]
                similarity = similarities[idx]
                
                if similarity >= 0.3:  # 임계값 확인
                    result.append((hashtag_id, hashtag_text, float(similarity), "직접추천"))
            
            print(f"[DEBUG] 직접 추천에서 {len(result)}개 해시태그 추출")
            return result
            
        except Exception as e:
            print(f"[ERROR] 직접 해시태그 추출 실패: {e}")
        
        return []
    
    def recommend_hashtags_dual(self, title: str, content: str, count: int = 10, max_content_length: int = 1000) -> List[Tuple[int, str, float, str]]:
        """듀얼 방식: hashtag_embeddings.pkl 1위 키워드 + hashtag_vectors.pkl 상위 5개"""
        if not self.is_ready():
            raise RuntimeError("서비스가 초기화되지 않았습니다.")
        
        if len(content) > max_content_length:
            content = self.smart_text_summary(content, max_content_length)
        
        all_results = []
        seen_hashtags = set()
        
        # 1. hashtag_embeddings.pkl에서 1위 키워드의 모든 해시태그
        keyword_hashtags = self.get_top_keyword_hashtags(content)
        for hashtag_id, hashtag_text, score, source in keyword_hashtags:
            if hashtag_text not in seen_hashtags:
                # 1위 키워드 해시태그는 최고 가중치 적용
                all_results.append((hashtag_id, hashtag_text, score * 3.0, source))
                seen_hashtags.add(hashtag_text)
        
        print(f"[DEBUG] 1위 키워드에서 {len(keyword_hashtags)}개 해시태그 추가")
        
        # 2. hashtag_vectors.pkl에서 직접 상위 5개
        direct_hashtags = self.get_direct_hashtags(content, top_k=5)
        for hashtag_id, hashtag_text, score, source in direct_hashtags:
            if hashtag_text not in seen_hashtags:
                # 직접 추천은 기본 가중치 적용
                all_results.append((hashtag_id, hashtag_text, score * 2.0, source))
                seen_hashtags.add(hashtag_text)
        
        print(f"[DEBUG] 직접 추천에서 {len([r for r in direct_hashtags if r[1] not in seen_hashtags])}개 해시태그 추가")
        
        # 점수로 정렬하고 요청된 개수만큼 반환
        all_results.sort(key=lambda x: -x[2])
        final_results = all_results[:count]
        
        print(f"[DEBUG] 최종 결과: {len(final_results)}개 (키워드: {len(keyword_hashtags)}개, 직접: {len(final_results) - len(keyword_hashtags)}개)")
        
        return final_results