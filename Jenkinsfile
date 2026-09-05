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

                sh 'docker inspect -f "{{.State.Running}}" student-management-server | grep true'

                sh 'docker inspect -f "{{.State.Running}}" student-management-client | grep true'

                echo 'Health Check Passed - Both containers are running'
            }
        }
    }

    post {

        success {
            echo '=========================================='
            echo ' STUDENT MANAGEMENT SYSTEM DEPLOYED'
            echo '=========================================='
            echo ' Frontend: http://localhost:5173'
            echo ' Backend : http://localhost:5000'
            echo '=========================================='
            echo ' Jenkins CI/CD Pipeline Completed Successfully'
            echo '=========================================='
        }

        failure {
            echo '=========================================='
            echo ' JENKINS PIPELINE FAILED'
            echo '=========================================='
            echo ' Check the Console Output for the error'
            echo '=========================================='
        }

        always {
            sh 'docker compose ps || true'
        }
        
    }
}