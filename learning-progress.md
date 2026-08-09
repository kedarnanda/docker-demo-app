# Docker, Kubernetes & CI/CD — Learning Progress

---

## Overview

This document covers everything learned over 2 days of hands-on practice with Docker, Kubernetes, Node.js, npm, Git, and CI/CD pipelines.

---

## Day 1 — Docker & Kubernetes

### 1. Docker Basics

#### What is Docker?
Docker packages applications into **containers** — isolated, portable units that run the same everywhere.

#### Key Docker CLI Commands:
```bash
docker images                          # list all images
docker pull nginx                      # download image
docker build -t myapp:v1 .             # build image
docker rmi image_id                    # delete image
docker ps                              # list running containers
docker ps -a                           # list all containers
docker run -d nginx                    # run in background
docker run -p 8080:80 nginx            # port mapping HOST:CONTAINER
docker stop container_id               # stop container
docker rm container_id                 # delete container
docker logs -f container_id            # stream logs
docker exec -it container_id bash      # open shell inside container
docker system prune                    # clean up unused resources
```

#### Port Mapping Rule:
```
-p 8080:80
   │    │
   │    └── Container port (inside Docker)
   └──────── Host port (your laptop/browser)
```

---

### 2. Docker Compose

#### What is Docker Compose?
Runs multiple containers together as one application.

#### Key Commands:
```bash
docker compose up              # reads docker-compose.yml automatically
docker compose up -d           # run in background
docker compose -f myfile.yml up # use custom file
docker compose down            # stop all services
docker compose logs            # view logs
docker compose ps              # list services
```

#### Important:
- Automatically looks for `docker-compose.yml` in current folder
- Groups all containers under one app name (taken from folder name)
- `depends_on` controls startup order

#### Example docker-compose.yml:
```yaml
version: '3'
services:
  mongodb:
    image: mongo:7.0
    ports:
      - 27017:27017
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_BASICAUTH_USERNAME=expressadmin
      - ME_CONFIG_BASICAUTH_PASSWORD=expresspassword

  my-app:
    image: my-app:1.0
    ports:
      - 3000:3000
    environment:
      - MONGO_DB_USERNAME=admin
      - MONGO_DB_PWD=password
    depends_on:
      - mongodb

volumes:
  mongo-data:
    driver: local
```

---

### 3. Kubernetes (K8s)

#### What is Kubernetes?
Kubernetes manages and orchestrates containers across many machines in production.

```
Docker     = builds and runs containers
Kubernetes = manages many containers at scale
```

#### Key Kubernetes Resources:

| Resource | Purpose |
|---|---|
| Deployment | Manages pods, handles rolling updates |
| Service | Exposes pods to network |
| ConfigMap | Stores non-sensitive config |
| Secret | Stores sensitive data (passwords) |
| Pod | Runs the container |
| ReplicaSet | Manages number of pod replicas |

#### Key kubectl Commands:
```bash
kubectl apply -f file.yaml              # apply config
kubectl get pods                        # list pods
kubectl get services                    # list services
kubectl get deployments                 # list deployments
kubectl logs pod-name                   # view logs
kubectl logs pod-name --previous        # logs from crashed pod
kubectl describe pod pod-name           # detailed pod info
kubectl exec -it pod-name bash          # shell inside pod
kubectl rollout restart deployment/name # restart deployment
```

#### Service Types:

| Type | Use Case |
|---|---|
| ClusterIP | Internal only (pod to pod) |
| NodePort | External access (Minikube/local) |
| LoadBalancer | Production (cloud) |

#### Bugs Fixed in YAML files:

**mongo.yaml bugs:**
```yaml
# Wrong — missing space after dash
-name: MONGO_INITDB_ROOT_USERNAME

# Fixed
- name: MONGO_INITDB_ROOT_USERNAME

# Wrong selector
selector:
  app.kubernetes.io/name: mongo

# Fixed — must match pod labels
selector:
  app: mongo
```

**webapp.yaml bugs:**
```yaml
# Wrong — lowercase
nodeport: 30100

# Fixed
nodePort: 30100
```

#### Minikube on Mac:
```bash
minikube start                         # start cluster
minikube status                        # check status
minikube dashboard                     # open UI in browser
minikube service webapp-service        # open service URL
minikube service webapp-service --url  # get URL only
```

#### Why localhost does not work on Mac:
On Mac, Minikube runs inside a VM — `192.168.49.2` is not accessible directly. Use `minikube service` command instead which creates a tunnel to `127.0.0.1`.

---

### 4. Node.js & npm

#### What is JavaScript?
Programming language that runs in the **browser** — makes web pages interactive.

#### What is Node.js?
JavaScript running on a **server** — allows one language for both frontend and backend.

#### What is npm?
Node Package Manager — downloads and manages JavaScript packages.

```bash
npm install          # download all packages from package.json
npm install express  # download specific package
npm start            # run scripts.start from package.json
npm test             # run scripts.test from package.json
```

#### package.json explained:
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.22.2",
    "mongodb": "^3.7.4",
    "body-parser": "^1.20.6"
  },
  "devDependencies": {
    "jest": "^29.x.x"
  }
}
```

#### Why NOT to push node_modules:
- Very large (100MB-500MB)
- Recreated by `npm install`
- Not your code
- Different per OS

```bash
echo "node_modules" > .gitignore
```

#### Correct order:
```bash
npm install        # creates node_modules
node server.js     # uses node_modules to run app
```

---

### 5. index.html & server.js

#### How they work together:
```
Browser opens http://localhost:3000
        ↓
server.js receives request
        ↓
server.js sends back index.html
        ↓
Browser displays index.html
        ↓
JavaScript calls APIs (/get-profile)
        ↓
server.js talks to MongoDB
        ↓
Returns data to browser
```

#### index.html has 3 sections:
```
<style>   → CSS  (how it looks)
<script>  → JS   (how it behaves)
<body>    → HTML (what is on the page)
```

#### Key rule:
- `index.html` never touches database directly
- `server.js` never renders HTML directly
- They communicate via API calls

---

## Day 2 — Git, GitHub Actions & CI/CD

### 6. Git Branching Strategy

#### Branch Structure:
```
main (prod)   ← stable, live code
dev           ← development branch
feature/*     ← temporary, per task
```

#### Local Folder Structure:
```
myprojects/
├── workspace/        ← WHERE YOU WRITE CODE
│     └── docker-demo-app
├── dev/              ← CD AUTO DEPLOYS HERE (do not touch)
│     └── docker-demo-app
└── prod/             ← CD AUTO DEPLOYS HERE (do not touch)
      └── docker-demo-app
```

#### Daily Workflow:
```bash
cd ~/myprojects/workspace/docker-demo-app
git checkout dev
git pull origin dev
git checkout -b feature/my-change
# make changes
git add .
git commit -m "my change"
git push origin feature/my-change
# raise PR → dev → get approval → merge
# raise PR → main → get approval → merge
```

#### Branch Protection Rules (both main and dev):
```
Require pull request before merging
Require approvals (min 1)
Dismiss stale approvals
Require status checks to pass
```

---

### 7. Pull Request (PR) Workflow

#### What is a PR?
A request to merge code from one branch to another with code review and approval.

#### PR Flow:
```
Create feature branch
        ↓
Write code
        ↓
Push to GitHub
        ↓
Create PR on GitHub
        ↓
Add reviewer
        ↓
Reviewer approves
        ↓
Merge into target branch
        ↓
Delete feature branch
```

#### Important Rules:
- Never push directly to main or dev
- Always use feature branch → PR
- Author cannot approve their own PR
- CI must pass before merging

---

### 8. GitHub Actions CI Pipeline

#### What is CI?
Continuous Integration — automatically tests code on every PR.

#### CI Workflow file (.github/workflows/ci.yml):
```yaml
name: CI Pipeline

on:
  pull_request:
    branches:
      - dev
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install
        working-directory: ./app

      - name: Run tests
        run: npm test
        working-directory: ./app
```

#### Jest Tests written:
```javascript
test('simple test - addition works', () => {
    expect(2 + 3).toBe(5);
});

test('app runs on port 3000', () => {
    expect(3000).toBe(3000);
});

test('MongoDB Docker URL is correct', () => {
    const mongoUrlDocker = "mongodb://admin:password@mongodb:27017";
    expect(mongoUrlDocker).toContain('mongodb');
    expect(mongoUrlDocker).toContain('27017');
});

test('MongoDB connects successfully', async () => {
    const client = new MongoClient('mongodb://admin:password@localhost:27017');
    await client.connect();
    expect(client).toBeDefined();
    await client.close();
}, 10000);
```

---

### 9. Self-Hosted Runner & CD Pipeline

#### What is a Runner?
A machine that executes GitHub Actions jobs.

| Type | Machine | Use Case |
|---|---|---|
| GitHub-hosted | GitHub's servers | Cannot access local folders |
| Self-hosted | Your Mac/server | Can access local folders |

#### Setting up self-hosted runner on Mac:
```bash
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-osx-arm64.tar.gz -L <github-url>
tar xzf ./actions-runner-osx-arm64.tar.gz
./config.sh --url https://github.com/kedarnanda/docker-demo-app --token YOUR_TOKEN
./run.sh
```

#### CD Workflow file (.github/workflows/cd.yml):
```yaml
name: CD Pipeline

on:
  push:
    branches:
      - dev
      - main

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Deploy to dev
        if: github.ref == 'refs/heads/dev'
        run: |
          cd /Users/kedarnanda/myprojects/dockerproject/dev/docker-demo-app
          git fetch origin dev
          git reset --hard origin/dev
          docker compose down
          docker compose up -d
          echo "Deployed to DEV"

      - name: Deploy to prod
        if: github.ref == 'refs/heads/main'
        run: |
          cd /Users/kedarnanda/myprojects/dockerproject/prod/docker-demo-app
          git fetch origin main
          git reset --hard origin/main
          docker compose down
          docker compose up -d
          echo "Deployed to PROD"
```

#### Key fix — use git reset instead of git pull:
```bash
# Wrong — fails if local changes exist
git pull origin main

# Correct — force overwrites local changes
git fetch origin main
git reset --hard origin/main
```

---

### 10. Full CI/CD Flow

```
Developer writes code in workspace/
        ↓
git checkout -b feature/my-change
        ↓
git push origin feature/my-change
        ↓
Raise PR → dev
        ↓
GitHub Actions CI runs automatically
  Install dependencies
  Run Jest tests
  MongoDB connection test
        ↓
Reviewer approves
        ↓
Merge into dev
        ↓
CD triggers → deploys to /dev folder
        ↓
Raise PR → main
        ↓
CI runs again
        ↓
Reviewer approves
        ↓
Merge into main
        ↓
CD triggers → deploys to /prod folder
```

---

## Summary — What Was Set Up

| Component | Status |
|---|---|
| Docker containers (MongoDB, Mongo Express, WebApp) | Done |
| Kubernetes deployment (Minikube) | Done |
| Git branching strategy (main, dev, feature) | Done |
| Branch protection rules | Done |
| Local dev and prod folders | Done |
| PR workflow with approvals | Done |
| GitHub Actions CI pipeline | Done |
| Jest tests | Done |
| Self-hosted runner | Done |
| CD pipeline (auto deploy) | Done |

---

## Next Steps

```
Move to AWS (EKS, ECR, EC2)
Add more comprehensive tests
Add Docker image build to CI pipeline
Set up monitoring (Prometheus/Grafana)
Set up ArgoCD for GitOps
Learn Helm charts
```

---

## Key Lessons Learned

1. Containers talk via **service names** not localhost in Docker/Kubernetes
2. node_modules **never pushed** to GitHub — recreated by npm install
3. **Never push directly** to main or dev — always use feature branches and PRs
4. **CI catches bugs** before they reach production
5. **CD automates deployment** — no manual steps needed
6. **Self-hosted runner** needed for deploying to local folders
7. **Branch protection** enforces code review in teams
8. prod folder needs **read/write** permission for CD to deploy
9. Use **git reset --hard** in CD instead of git pull to force overwrite
10. **workspace folder** is where you code — dev/prod folders are for CD only
