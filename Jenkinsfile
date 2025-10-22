pipeline {
    agent {
        label 'built-in'
    }
    
    environment {
        COMPOSE_PROJECT_NAME = 'spring-react-app'
        // Jenkins가 Docker 컨테이너로 실행되므로 컨테이너 이름 사용
        ELASTICSEARCH_URL = 'local-elasticsearch:9200'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitLab...'
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building React frontend...'
                dir('frontend/feelroom') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                echo 'Building Spring Boot backend...'
                dir('backend/feelroom') {
                    sh 'chmod +x gradlew'
                    sh './gradlew clean build -x test'
                }
            }
        }
        
        stage('Stop Current Services') {
            steps {
                echo 'Stopping current services (except Elasticsearch)...'
                sh '''
                    # 특정 컨테이너들만 중지 (Elasticsearch 제외)
                    docker stop movie-redis movie-backend movie-frontend || true
                    docker rm movie-redis movie-backend movie-frontend || true
                '''
            }
        }
        
        stage('Setup Elasticsearch') {
            steps {
                echo 'Setting up Elasticsearch with Nori...'
                sh '''
                    # Elasticsearch가 실행중인지 확인
                    if ! docker ps | grep -q local-elasticsearch; then
                        echo "Starting Elasticsearch..."
                        docker-compose up -d elasticsearch
                        sleep 30
                        
                        # Nori 플러그인 설치
                        echo "Installing Nori plugin..."
                        docker exec local-elasticsearch bin/elasticsearch-plugin install analysis-nori || true
                        docker restart local-elasticsearch
                        sleep 30
                    else
                        echo "Elasticsearch already running"
                        
                        # Nori 플러그인 확인 및 설치
                        if ! docker exec local-elasticsearch bin/elasticsearch-plugin list | grep -q analysis-nori; then
                            echo "Installing Nori plugin..."
                            docker exec local-elasticsearch bin/elasticsearch-plugin install analysis-nori || true
                            docker restart local-elasticsearch
                            sleep 30
                        fi
                    fi
                    
                    # Jenkins를 같은 네트워크에 연결 (이미 연결되어 있다면 에러 무시)
                    docker network connect spring-react-app_movie-network jenkins || true
                    
                    # Elasticsearch 연결 테스트 (Docker 네트워크 사용)
                    echo "Testing Elasticsearch connection via Docker network..."
                    curl -v "http://${ELASTICSEARCH_URL}/" || echo "Connection test failed, but continuing..."
                    
                    # 인덱스 존재 확인 및 생성
                    echo "Checking if movies index exists..."
                    INDEX_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "http://${ELASTICSEARCH_URL}/movies" || echo "404")
                    
                    if [ "$INDEX_EXISTS" = "404" ]; then
                        echo "Creating movies index..."
                        curl -X PUT "http://${ELASTICSEARCH_URL}/movies" \
                             -H 'Content-Type: application/json' \
                             -d '{
                               "settings": {
                                 "analysis": {
                                   "analyzer": {
                                     "nori_analyzer": {
                                       "type": "nori",
                                       "decompound_mode": "mixed"
                                     }
                                   }
                                 }
                               },
                               "mappings": {
                                 "properties": {
                                   "movieId": { "type": "integer" },
                                   "title": { 
                                     "type": "text", 
                                     "analyzer": "nori_analyzer",
                                     "fields": {
                                       "exact": { "type": "keyword" }
                                     }
                                   },
                                   "overview": { 
                                     "type": "text", 
                                     "analyzer": "nori_analyzer" 
                                   },
                                   "releaseDate": { "type": "date" },
                                   "voteAverage": { "type": "float" },
                                   "voteCount": { "type": "integer" },
                                   "runtime": { "type": "integer" },
                                   "posterUrl": { "type": "keyword" },
                                   "tmdbId": { "type": "integer" },
                                   "genres": { "type": "keyword" },
                                   "actors": { "type": "keyword" },
                                   "directors": { "type": "keyword" }
                                 }
                               }
                             }'
                        echo ""
                        echo "Index creation completed"
                    else
                        echo "Movies index already exists (HTTP $INDEX_EXISTS)"
                    fi
                    
                    # Elasticsearch 상태 확인
                    echo "Checking Elasticsearch status..."
                    curl -s "http://${ELASTICSEARCH_URL}/_cluster/health?pretty" || echo "Status check failed"
                    echo "Checking plugins..."
                    docker exec local-elasticsearch bin/elasticsearch-plugin list
                '''
            }
        }
        

        stage('Deploy') {
    steps {
        echo 'Starting services...'
        sh '''
            # 특정 컨테이너들 완전 정리 (Elasticsearch 제외)
            echo "Stopping and removing containers..."
            docker stop movie-redis movie-fastapi movie-backend movie-frontend || true
            docker rm movie-redis movie-fastapi movie-backend movie-frontend || true
            
            # 혹시 남아있는 dangling 컨테이너들 정리
            docker container prune -f
            
            # 서비스 시작 (강제 리빌드 및 재생성)
            echo "Starting services with force recreate..."
            docker-compose up -d --build --force-recreate redis fastapi backend frontend
            
            # 컨테이너 상태 확인
            echo "Checking container status..."
            docker ps --filter "name=movie-"
        '''
    }
}
        
        stage('Health Check') {
            steps {
                echo 'Checking if services are running...'
                sh '''
                    sleep 30
                    docker-compose ps
                    
                    # Elasticsearch 인덱스 확인
                    echo "Checking Elasticsearch indices..."
                    curl -s "http://${ELASTICSEARCH_URL}/_cat/indices?v" || echo "Index check failed"
                    
                    # 서비스 상태 확인
                    echo "Checking service connectivity..."
                    echo "Backend status:"
                    curl -f http://localhost:8081/actuator/health || echo "Backend not ready yet"
                    echo "Frontend status:"
                    curl -f http://localhost:3000 || echo "Frontend not ready yet"
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful! 🎉'
        }
        failure {
            echo 'Deployment failed! 😞'
            sh '''
                echo "=== Docker Compose Logs ==="
                docker-compose logs --tail=50
                echo "=== Docker Network Info ==="
                docker network ls
                docker network inspect spring-react-app_movie-network || true
                echo "=== Container Status ==="
                docker ps -a
            '''
        }
        always {
            echo 'Cleaning up...'
            sh 'docker system prune -f || true'
        }
    }
}