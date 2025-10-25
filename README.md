### Monorepo Docker Build Pattern

This project uses a monorepo structure with separate nested Dockerfiles for each service (backend, frontend, etc.).

- **Build context**: Always use the repository root as the Docker build context. This ensures each service's Dockerfile can access shared code (e.g., the shared folder).
- **Dockerfiles**: Each service has its own Dockerfile in its project folder, keeping build logic isolated and maintainable.
- **Shared code**: Both backend and frontend Dockerfiles copy the shared folder from the root into their build images.
- **Consistency**: Builds must be triggered from the root context, not from inside individual service folders.
  This pattern is common in monorepos and ensures all services can access shared libraries while keeping builds modular and organized.

This pattern is common in monorepos and ensures all services can access shared libraries while keeping builds modular and organized.
