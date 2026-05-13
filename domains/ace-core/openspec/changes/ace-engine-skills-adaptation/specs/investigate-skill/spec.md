## ADDED Requirements

### Requirement: Check start.sh Status

investigate Skill SHALL check if start.sh services are running.

#### Scenario: Detect service status

**WHEN** investigating issues  
**THEN** investigate SHALL check if backend/frontend processes are running

### Requirement: Read Service Logs

investigate Skill SHALL read logs from /tmp/{project}-backend.log and /tmp/{project}-frontend.log.

#### Scenario: Analyze recent errors

**WHEN** services are failing  
**THEN** investigate SHALL tail last 100 lines of log files

### Requirement: Check Docker Containers

investigate Skill SHALL verify Docker containers status.

#### Scenario: Detect Docker issues

**WHEN** database connection fails  
**THEN** investigate SHALL run `docker ps | grep {project}` to check container status
