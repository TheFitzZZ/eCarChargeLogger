#!/bin/bash

# Electricity Meter Tracker - Management Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}==================================================${NC}"
    echo -e "${BLUE}  Electricity Meter Tracker - Management${NC}"
    echo -e "${BLUE}==================================================${NC}"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi
}

start_app() {
    echo -e "${GREEN}Starting application...${NC}"
    docker compose up -d
    echo ""
    echo -e "${GREEN}✓ Application started!${NC}"
    echo ""
    show_urls
}

stop_app() {
    echo -e "${YELLOW}Stopping application...${NC}"
    docker compose down
    echo -e "${GREEN}✓ Application stopped${NC}"
}

restart_app() {
    echo -e "${YELLOW}Restarting application...${NC}"
    docker compose restart
    echo -e "${GREEN}✓ Application restarted${NC}"
    echo ""
    show_urls
}

rebuild_app() {
    echo -e "${YELLOW}Rebuilding application...${NC}"
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    echo -e "${GREEN}✓ Application rebuilt and started${NC}"
    echo ""
    show_urls
}

show_logs() {
    SERVICE=${1:-""}
    if [ -z "$SERVICE" ]; then
        docker compose logs -f
    else
        docker compose logs -f "$SERVICE"
    fi
}

show_status() {
    echo -e "${BLUE}Container Status:${NC}"
    docker compose ps
    echo ""
    show_urls
}

show_urls() {
    FRONTEND_PORT=${FRONTEND_PORT:-8080}
    BACKEND_PORT=${BACKEND_PORT:-8081}
    
    if [ -f .env ]; then
        source .env
    fi
    
    echo -e "${GREEN}Application URLs:${NC}"
    echo -e "  Frontend:  ${BLUE}http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "  Backend:   ${BLUE}http://localhost:${BACKEND_PORT}${NC}"
    echo -e "  Health:    ${BLUE}http://localhost:${BACKEND_PORT}/health${NC}"
    echo ""
}

backup_database() {
    BACKUP_DIR="./database/backups"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/meter_tracker_${TIMESTAMP}.db"
    
    if [ -f "./database/meter_tracker.db" ]; then
        echo -e "${YELLOW}Creating backup...${NC}"
        cp "./database/meter_tracker.db" "$BACKUP_FILE"
        echo -e "${GREEN}✓ Backup created: ${BACKUP_FILE}${NC}"
    else
        echo -e "${RED}Error: Database file not found${NC}"
        exit 1
    fi
}

reset_database() {
    echo -e "${RED}WARNING: This will delete all data!${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY == "yes" ]]; then
        docker compose down
        rm -f ./database/*.db*
        echo -e "${GREEN}✓ Database reset${NC}"
        echo -e "${YELLOW}Starting application with fresh database...${NC}"
        docker compose up -d
    else
        echo -e "${YELLOW}Reset cancelled${NC}"
    fi
}

show_help() {
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start the application"
    echo "  stop        Stop the application"
    echo "  restart     Restart the application"
    echo "  rebuild     Rebuild and restart the application"
    echo "  logs        Show logs (add 'backend' or 'frontend' for specific service)"
    echo "  status      Show application status"
    echo "  backup      Backup the database"
    echo "  reset       Reset database (WARNING: deletes all data)"
    echo "  help        Show this help message"
    echo ""
}

# Main script
print_header
check_docker

case "${1:-help}" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    rebuild)
        rebuild_app
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    reset)
        reset_database
        ;;
    help|*)
        show_help
        ;;
esac
