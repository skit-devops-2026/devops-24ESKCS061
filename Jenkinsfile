pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'ghcr.io/skit-devops-2026/devops-24eskcs061'
        PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Lint') {
            steps {
                sh 'npm ci'
                sh 'npm run lint'
            }
        }

        stage('Automated Testing') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build & Asset Verification') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Container Healthcheck Test') {
            steps {
                sh """
                docker run -d --name studyos-test -p 3000:3000 ${IMAGE_NAME}:latest
                sleep 5
                curl -f http://localhost:3000/health
                curl -f http://localhost:3000/metrics
                docker stop studyos-test
                docker rm studyos-test
                """
            }
        }

        stage('Publish Container Image') {
            steps {
                // Requires GHCR credentials configured in Jenkins credentials store
                withCredentials([usernamePassword(credentialsId: 'github-registry', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
                    sh 'echo $REGISTRY_PASS | docker login ghcr.io -u $REGISTRY_USER --password-stdin'
                    sh "docker push ${IMAGE_NAME}:latest"
                    sh "docker push ${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        stage('Kubernetes Validation') {
            steps {
                sh 'kubectl apply --dry-run=client -f k8s/'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline executed successfully for StudyOS MT2."
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
