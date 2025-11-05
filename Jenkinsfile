pipeline {
    agent any

    environment {
        // Repository and Docker settings
        GIT_REPO            = 'https://github.com/gtvsoftware/catalogo-pft.git'
        GIT_BRANCH          = 'main'
        DOCKER_IMAGE        = 'terravivasoftware/catalogo-pft-homolog'
        CONTAINER_NAME      = 'catalogo-pft'
        PORT                = '24050'

        // Remote host configuration
        REMOTE_HOST         = '10.0.0.12'
        REMOTE_USER         = 'administrador'
        SSH_CREDENTIALS_ID  = 'dda-hml'

        // Git credentials for cloning
        GIT_CREDENTIALS_ID  = 'git-jenkins'

        DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1053280132372111420/XVAvwXfs-QhvQB2PEXNG2b8u5d78RwbsYHUGsmyAvC1Arqcwco06zgMHCfijKD2-FH-B'

        // Environment variables for Dockerfile build and runtime
        // These names match the ARGs and ENVs defined in the Dockerfile
        
        NEXT_PUBLIC_ASSETS_URL='https://megtv2.blob.core.windows.net'
        NEXT_PUBLIC_APP_URL='https://catalogo.hml.terraviva.agr.br'
        NEXT_PUBLIC_BASE_PATH=''
        AUTH_URL='https://conta.terraviva.agr.br'
        AUTH_SECRET='0W1TEtH!S*1asdasdassadHa&h'
        AUTH_ISSUER_URL='https://login.terraviva.agr.br/realms/terraviva'
        AUTH_CLIENT_ID='catalogo-pft-homolog'
        AUTH_CLIENT_SECRET='pZkAC1VNLadadasdasdWJW09ua'
        NEXT_PUBLIC_TYPESENSE_HOST='10.0.0.12'
        NEXT_PUBLIC_TYPESENSE_PORT='8108'
        NEXT_PUBLIC_TYPESENSE_PROTOCOL='http'
        NEXT_PUBLIC_TYPESENSE_SEARCH_KEY='triPhonuwrlD5edabrlstiml7itojuml'
        DATABASE_URL='mongodb://megtv:123@10.0.0.12:16000/catalogo-pft?authSource=admin&replicaSet=rs0&directConnection=true'
        
        PROJECT='@terraviva/catalogo-pft'
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
                    docker build \\
                        --build-arg DATABASE_URL="${DATABASE_URL}" \\
                        --build-arg AUTH_URL=${AUTH_URL} \\
                        --build-arg "AUTH_SECRET=${AUTH_SECRET}" \\
                        --build-arg AUTH_ISSUER_URL=${AUTH_ISSUER_URL} \\
                        --build-arg AUTH_CLIENT_ID=${AUTH_CLIENT_ID} \\
                        --build-arg AUTH_CLIENT_SECRET=${AUTH_CLIENT_SECRET} \\
                        --build-arg NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \\
                        --build-arg NEXT_PUBLIC_ASSETS_URL=${NEXT_PUBLIC_ASSETS_URL} \\
                        --build-arg NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH} \\
                        --build-arg NEXT_PUBLIC_TYPESENSE_HOST=${NEXT_PUBLIC_TYPESENSE_HOST} \\
                        --build-arg NEXT_PUBLIC_TYPESENSE_PORT=${NEXT_PUBLIC_TYPESENSE_PORT} \\
                        --build-arg NEXT_PUBLIC_TYPESENSE_PROTOCOL=${NEXT_PUBLIC_TYPESENSE_PROTOCOL} \\
                        --build-arg NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=${NEXT_PUBLIC_TYPESENSE_SEARCH_KEY} \\
                        --build-arg PROJECT=${PROJECT} \\
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
                            docker run -d --name ${CONTAINER_NAME} -p ${PORT}:3000 \\
                            -e "DATABASE_URL=${DATABASE_URL}" \\
                            -e "AUTH_URL=${AUTH_URL}" \\
                            -e "AUTH_SECRET=${AUTH_SECRET}" \\
                            -e "AUTH_ISSUER_URL=${AUTH_ISSUER_URL}" \\
                            -e "AUTH_CLIENT_ID=${AUTH_CLIENT_ID}" \\
                            -e "AUTH_CLIENT_SECRET=${AUTH_CLIENT_SECRET}" \\
                            -e "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}" \\
                            -e "NEXT_PUBLIC_ASSETS_URL=${NEXT_PUBLIC_ASSETS_URL}" \\
                            -e "NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}" \\
                            -e "NEXT_PUBLIC_TYPESENSE_HOST=${NEXT_PUBLIC_TYPESENSE_HOST}" \\
                            -e "NEXT_PUBLIC_TYPESENSE_PORT=${NEXT_PUBLIC_TYPESENSE_PORT}" \\
                            -e "NEXT_PUBLIC_TYPESENSE_PROTOCOL=${NEXT_PUBLIC_TYPESENSE_PROTOCOL}" \\
                            -e "NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=${NEXT_PUBLIC_TYPESENSE_SEARCH_KEY}" \\
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
