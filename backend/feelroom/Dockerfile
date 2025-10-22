FROM gradle:8.5-jdk21-alpine AS build

WORKDIR /app

# 전체 프로젝트 복사 (feelroom 폴더 내용)
COPY . .

# Gradle Wrapper 권한 설정 (있다면)
RUN chmod +x gradlew || true

# 애플리케이션 빌드
RUN gradle clean build --no-daemon -x test

# 실행 단계
FROM openjdk:21-jdk-slim

WORKDIR /app

# 타임존 설정 추가 시작
RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# 타임존 설정 추가 끝

# 빌드된 JAR 파일 복사 (구체적인 파일명 지정)
COPY --from=build /app/build/libs/feelroom-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
