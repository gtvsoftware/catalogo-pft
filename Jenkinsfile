pipeline {
    agent any

    environment {
        // Repository and Docker settings
        GIT_REPO       = 'https://github.com/gtvsoftware/megtv-front.git'
        GIT_BRANCH     = 'homolog'
        DOCKER_IMAGE   = 'terravivasoftware/megtv2-frontend-homolog'
        CONTAINER_NAME = 'megtv-frontend'
        PORT           = '18000'
        
        // Remote host configuration
        REMOTE_HOST         = '10.0.0.12'
        REMOTE_USER         = 'administrador'
        SSH_CREDENTIALS_ID  = 'dda-hml'

        // Git credentials for cloning
        GIT_CREDENTIALS_ID  = 'git-jenkins'
        
        DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1053280132372111420/XVAvwXfs-QhvQB2PEXNG2b8u5d78RwbsYHUGsmyAvC1Arqcwco06zgMHCfijKD2-FH-B'
        
        // Runtime Envs
        AUTH_SECRET='0W1TEtH!S*1nLjo&ES+u3*&&trLTHa&h'
        AUTH_URL='https://conta.terraviva.agr.br'

        AUTH_ISSUER_URL='https://login.terraviva.agr.br/realms/terraviva'
        AUTH_CLIENT_SECRET='pZkAC1VNLa8SG4sZN3FRXo62aWJW09ua'
        AUTH_CLIENT_ID='megtv-homolog'
        
        // Build arguments for Dockerfile
        bff_url='https://apiweb.hml.terraviva.agr.br/web'
        bff_mobile_url='https://apiweb.hml.terraviva.agr.br/mobile'
        assets_url='https://megtv2.blob.core.windows.net'
        auth_gateway_url='https://sso.hml.terraviva.agr.br'
        app_url='https://megtv.hml.terraviva.agr.br'
        io_url=''
        app_env='production'
        webapps_appointments='https://apps.hml.terraviva.agr.br/apontamentos'
        graphql_url=''
        webapps_5s='https://apps.hml.terraviva.agr.br/5s'
        eventsweb='https://apps.hml.terraviva.agr.br/eventos'
        base_path='/'
        issuer_url='https://login.terraviva.agr.br/realms/terraviva'
        client_id='megtv-homolog'
        client_secret='pZkAC1VNLa8SG4sZN3FRXo62aWJW09ua'
        secret='my_ultra_secure_nextauth_secret'
        auth_url='https://conta.terraviva.agr.br'
        indicators_results_api='https://api.hml.terraviva.agr.br/indicators-results'
        webapps_reports='https://apps.hml.terraviva.agr.br/relatorios'
        
        // Database URL for Prisma generation during build
        database_url='sqlserver://10.0.0.57:2433;database=MEGTV2_QA;user=flowers;password=@oC34%#3TV21;encrypt=true;trustServerCertificate=true;'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Clone the repository using the stored Git credentials and update submodules recursively
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO}",
                        credentialsId: "${GIT_CREDENTIALS_ID}"
                    ]],
                    extensions: [
                        [$class: 'SubmoduleOption',
                         recursiveSubmodules: true,
                         parentCredentials: true]
                    ]
                ])
            }
        }

        
        stage('Build Image') {
            steps {
                script {
                    sh """
                    docker build \
                        --build-arg NEXT_PUBLIC_BFF_WEB_URL=${bff_url} \
                        --build-arg NEXT_PUBLIC_BFF_MOBILE_URL=${bff_mobile_url} \
                        --build-arg NEXT_PUBLIC_ASSETS_URL=${assets_url} \
                        --build-arg NEXT_PUBLIC_AUTH_GATEWAY_URL=${auth_gateway_url} \
                        --build-arg NEXT_PUBLIC_APP_URL=${app_url} \
                        --build-arg NEXT_PUBLIC_APP_ENV=${app_env} \
                        --build-arg NEXT_PUBLIC_WEBAPPS_APPOINTMENTS=${webapps_appointments} \
                        --build-arg NEXT_PUBLIC_WEBAPPS_5S=${webapps_5s} \
                        --build-arg NEXT_PUBLIC_EVENTSWEB=${eventsweb} \
                        --build-arg NEXT_PUBLIC_BASE_PATH=${base_path} \
                        --build-arg AUTH_ISSUER_URL=${issuer_url} \
                        --build-arg AUTH_CLIENT_ID=${client_id} \
                        --build-arg AUTH_CLIENT_SECRET=${client_secret} \
                        --build-arg AUTH_URL=${auth_url} \
                        --build-arg NEXT_PUBLIC_INDICATORS_RESULTS_API=${indicators_results_api} \
                        --build-arg NEXT_PUBLIC_WEBAPPS_REPORTS=${webapps_reports} \
                        --build-arg DATABASE_URL='${database_url}' \
                        --build-arg PROJECT=@terraviva/megtv-front \
                        -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                    """
                }
            }
        }

        
        stage('Push Image') {
            steps {
                script {
                    // Use withDockerRegistry to log in to Docker Hub automatically
                    withDockerRegistry([credentialsId: 'dockerhub']) {
                        sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }
        
        stage('Deploy to Remote Host') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS_ID]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} << 'EOF'
                            docker pull ${DOCKER_IMAGE}:${BUILD_NUMBER}
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            docker run -d --name ${CONTAINER_NAME} -p ${PORT}:3000 \
                            -e "AUTH_URL=${AUTH_URL}" \
                            -e "AUTH_CLIENT_ID=${AUTH_CLIENT_ID}" \
                            -e "AUTH_CLIENT_SECRET=${AUTH_CLIENT_SECRET}" \
                            -e "AUTH_SECRET=${AUTH_SECRET}" \
                            -e "AUTH_ISSUER_URL=${AUTH_ISSUER_URL}" \
                            ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        """
                    }
                }
            }
        }

        
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
    }
    
    post {
        always {
            discordSend(
                webhookURL: "${DISCORD_WEBHOOK_URL}",
                description: "Resultado: ${currentBuild.currentResult}",
                footer: "Build #${BUILD_NUMBER}",
                link: "${BUILD_URL}",
                result: currentBuild.currentResult,
                title: "${JOB_NAME} - Build #${BUILD_NUMBER}"
            )
        }
    }
}