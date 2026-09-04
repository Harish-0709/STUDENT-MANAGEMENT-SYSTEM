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
                bat 'docker --version'
                bat 'docker compose version'
                bat 'docker compose config'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                bat 'docker compose down --remove-orphans || exit 0'
            }
        }

        stage('Deploy Application') {
            steps {
                bat 'docker compose up -d'
            }
        }

        stage('Check Containers') {
            steps {
                bat 'docker compose ps'
            }
        }

        stage('Health Check') {
            steps {
                bat 'timeout /t 15 /nobreak'
                bat 'curl -f http://localhost:5173/'
                bat 'curl -f http://localhost:5000/'
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
            bat 'docker compose ps || exit 0'
        }
    }
}