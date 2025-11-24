# 🚀 배포 가이드 (Deployment Guide)

## 개요
본 문서는 CaravanShare MVP 프로젝트의 배포 전략을 기술합니다.
Docker를 이용한 컨테이너 배포와 AWS EC2 수동 배포 방식을 모두 지원합니다.

## 1. Docker 배포 (권장)
Docker Compose를 사용하여 애플리케이션과 종속성을 일괄 관리합니다.

### 사전 요구사항
- Docker Engine 및 Docker Compose 설치
- Git 설치

### 배포 단계
1. 저장소 클론:
   ```bash
   git clone [https://github.com/pkjh8920-oss/Caravan-project.git](https://github.com/pkjh8920-oss/Caravan-project.git)
