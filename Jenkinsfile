pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh 'docker --version'
                sh 'docker compose version'
                sh 'docker compose config'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh 'docker compose down --remove-orphans || true'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Check Containers') {
            steps {
                sh 'docker compose ps'
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 15'
                sh 'curl -f http://localhost:5173/'
                sh 'curl -f http://localhost:5000/'
            }
        }
    }

    post {
        success {
            echo '=========================================='
            echo ' Student Management System DEPLOYED'
            echo ' Frontend: http://localhost:5173'
            echo ' Backend : http://localhost:5000'
            echo '=========================================='
        }

        failure {
            echo '=========================================='
            echo ' Jenkins Pipeline FAILED'
            echo ' Check the console output'
            echo '=========================================='
        }

        always {
            sh 'docker compose ps || true'
        }
    }
}