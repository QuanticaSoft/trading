---
name: deploy
description: Deploy the application to production.
---

steps:
  - Pull the latest changes from the main branch
  - Install dependencies and run tests
  - Build the Docker image for the application
  - Tag the image with the current commit SHA
  - Push the image to the container registry.
  - Update the deployment in the cluster with the new image.
  - Wait for the rollout to complete.
  - Run basic health checks against the service endpoint
  - Confirm the application is serving traffic successfully.
