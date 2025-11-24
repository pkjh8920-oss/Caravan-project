# 🛡️ 고가용성(HA) 및 확장성 아키텍처

## 현재 아키텍처 (MVP Phase 1)
- **단일 노드**: Monolithic Node.js 애플리케이션
- **데이터베이스**: 내장형 SQLite (파일 시스템 기반)
- **한계점**: Stateful한 DB 특성상 수평적 확장이 어려움

## 향후 로드맵 (Phase 2 & 3)

### 1. 로드 밸런싱 (Load Balancing)
- **NGINX**를 리버스 프록시로 도입하여 부하 분산 처리
- **AWS ELB (Elastic Load Balancer)** 를 사용하여 트래픽을 다수의 EC2 인스턴스로 분산

### 2. 데이터베이스 마이그레이션
- 동시성 처리를 위해 SQLite에서 **AWS RDS (PostgreSQL)** 로 전환
- **Read Replica** (읽기 전용 복제본)를 도입하여 읽기/쓰기 트래픽 분리

### 3. 컨테이너 오케스트레이션
- Docker Compose 환경을 **Kubernetes (K8s)** 로 마이그레이션
- CPU/메모리 사용량에 따른 **HPA (수평적 오토스케일링)** 구현

### 4. 캐싱 전략
- 세션 관리 및 빈번한 조회 데이터를 위해 **Redis** 도입
