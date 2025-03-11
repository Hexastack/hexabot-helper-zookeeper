## Hexabot ZooKeeper Helper
Hexabot ZooKeeper Helper is an extension that integrates ZooKeeper for managing configurations and coordinating distributed systems in your Hexabot project. This helper allows you to interact with ZooKeeper to store, retrieve, and manage configuration data efficiently.

Hexabot is an open-source chatbot/agent solution that allows users to create and manage AI-powered, multi-channel, and multilingual chatbots. For more information, visit the official GitHub repository.

## Features
- Distributed Coordination: Helps manage distributed systems by coordinating and synchronizing processes across machines.

- Leader Election: Facilitates leader election for distributed systems, ensuring one active leader for task coordination.

## Environment Setup
Set your environment variables in the ./docker/.env file. These variables will be used by Docker Compose to set up the ZooKeeper connection. Example variables:

```
ZOOKEEPER_PORT=2181
ZOOKEEPER_SERVERS="server.1=zoo1:2888:3888;2181"
```

## Settings Configuration

To configure the MINIO Helper, use the following settings in the Hexabot admin panel under **Settings > Minio**:

| **Label**     | **Default Value**       | **Type**      | **Description**                                 |
|---------------|-------------------------|---------------|-------------------------------------------------|
| `endpoint`    | `zoo1` (default)                | Text          | The endpoint for the Zookeeper server.             |
| `port`        | `2181` (default)                 | Number          | The port for the Zookeeper server.                 |
| `timeout`      | `5000` (default)    | Number          | The Heartbeat waiting time in ms.    |
| `path`      | `master` (default)    | Text          | The path is like an address that helps locate a specific piece of data (called also znode).    |
| `isHostOrderDeterministic`      | `false` (default)    | Checkbox          | Deterministic Host Order.    |



## Installation
First, navigate to your Hexabot project directory and make sure the dependencies are installed:

```sh
cd ~/projects/my-hexabot-project
npm install hexabot-helper-zookeeper
```

Then follow these steps:
1. Add the `docker-compose.zookeeper.yml` and `docker-compose.minio.dev.yml` files under the `docker/` folder.
2. Create three copies of the api/ folder
```sh
cp -r api api_s1_n1 && cp -r api api_s1_n2 && cp -r api api_s1_n3 
```
3. Start the Zookeeper and replicas services with the following command: `hexabot dev --services zookeeper,replicas`
4. Navigate to Settings > Zookeeper in the admin panel and update the settings.
5. Set the default storage helper: Navigate to Settings > Chatbot and update the Default Storage Helper to use minio-helper.

## Docker compose files

Below an example of Zookeeper docker compose file docker/`docker-compose.zookeeper.yml`:

```
version: "3.8"

services:
  zoo1:
    container_name: zoo1
    networks:
      - app-network
    image: zookeeper:3.8
    restart: always
    hostname: zoo1
    ports:
      - ${ZOOKEEPER_PORT}:2181
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: ${ZOOKEEPER_SERVERS}

networks:
  app-network:

```

Below an example of Zookeeper docker compose file docker/`docker-compose.replicas.yml`:

```
version: "3.8"

services:
  api_s1_n1:
    build:
      context: ../api_s1_n1
      target: development
    pull_policy: build
    ports:
      - 6001:3000
    env_file: .env
    networks:
      - db-network
      - app-network
    volumes:
      - ../api_s1_n1/src:/app/src
      - ../api_s1_n1/migrations:/app/migrations
    depends_on:
      mongo:
        condition: service_healthy
    healthcheck:
      test: "wget --spider http://localhost:3000"
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 10s

  api_s1_n2:
    build:
      context: ../api_s1_n2
      target: development
    pull_policy: build
    ports:
      - 6002:3000
    env_file: .env
    networks:
      - db-network
      - app-network
    volumes:
      - ../api_s1_n2/src:/app/src
      - ../api_s1_n2/migrations:/app/migrations
    depends_on:
      mongo:
        condition: service_healthy
    healthcheck:
      test: "wget --spider http://localhost:3000"
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 10s

  api_s1_n3:
    build:
      context: ../api_s1_n3
      target: development
    pull_policy: build
    ports:
      - 6003:3000
    env_file: .env
    networks:
      - db-network
      - app-network
    volumes:
      - ../api_s1_n3/src:/app/src
      - ../api_s1_n3/migrations:/app/migrations
    depends_on:
      mongo:
        condition: service_healthy
    healthcheck:
      test: "wget --spider http://localhost:3000"
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 10s

networks:
  db-network:
  app-network:

```


## Support
If you encounter any issues or have questions about using Hexabot Zookeeper Helper, feel free to contribute or open an issue on the Hexabot GitHub repository.

Feel free to join us on [Discord](https://discord.gg/rNb9t2MFkG)
