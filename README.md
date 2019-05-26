# Micros Server

## Docker Compose Config

```yml
version: '2'

services:
  slack-command:
    image: yule/slack-command
    ports:
      - 3000:3000
    env_file:
      - ./gitlab-token.env
      - ./slack-command-tokens.env

  gitlab-webhook:
    image: yule/gitlab-webhook
    ports:
      - 3001:3000
    env_file:
      - ./slack-webhook.env
      - ./gitlab-webhook-secret-token.env
      - ./gitlab-slack-user-map.env

```