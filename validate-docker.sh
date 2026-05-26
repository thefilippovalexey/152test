#!/bin/bash
# validate-docker.sh - Docker Compose validation script for FZ-152 Service

set -e

echo "🔍 Starting Docker Compose Validation..."
echo "========================================"

ERRORS=0
WARNINGS=0

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERROR: docker-compose.yml not found"
    exit 1
fi

echo "✅ docker-compose.yml exists"

# Validate YAML syntax
echo ""
echo "📋 Validating YAML syntax..."
if command -v docker &> /dev/null; then
    if docker compose config > /dev/null 2>&1; then
        echo "✅ Docker Compose syntax is valid"
    else
        echo "❌ ERROR: Invalid Docker Compose configuration"
        docker compose config 2>&1 | head -20
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  WARNING: Docker not installed, skipping runtime validation"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for required services
echo ""
echo "🔧 Checking required services..."
REQUIRED_SERVICES=("db" "backend" "frontend")
for service in "${REQUIRED_SERVICES[@]}"; do
    if grep -q "  $service:" docker-compose.yml; then
        echo "✅ Service '$service' defined"
    else
        echo "❌ ERROR: Service '$service' not found"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check PostgreSQL version
echo ""
echo "🗄️  Checking PostgreSQL version..."
if grep -q "postgres:16" docker-compose.yml; then
    echo "✅ PostgreSQL 16 specified"
else
    echo "❌ ERROR: PostgreSQL 16 not specified"
    ERRORS=$((ERRORS + 1))
fi

# Check Node.js version in Dockerfiles
echo ""
echo "🟢 Checking Node.js versions..."
for dockerfile in backend/Dockerfile frontend/Dockerfile; do
    if [ -f "$dockerfile" ]; then
        if grep -q "node:20" "$dockerfile"; then
            echo "✅ $dockerfile uses Node.js 20"
        else
            echo "❌ ERROR: $dockerfile does not use Node.js 20"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "❌ ERROR: $dockerfile not found"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check healthchecks
echo ""
echo "❤️  Checking healthchecks..."
if grep -q "healthcheck:" docker-compose.yml; then
    HEALTHCHECK_COUNT=$(grep -c "healthcheck:" docker-compose.yml)
    echo "✅ Found $HEALTHCHECK_COUNT healthcheck(s)"
    
    # Check db healthcheck
    if grep -A15 "^  db:" docker-compose.yml | grep -q "pg_isready"; then
        echo "✅ Database healthcheck configured"
    else
        echo "⚠️  WARNING: Database healthcheck may be missing"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check backend healthcheck
    if grep -A5 "backend:" docker-compose.yml | grep -q "/api/health"; then
        echo "✅ Backend healthcheck configured"
    else
        echo "⚠️  WARNING: Backend healthcheck may be missing"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ ERROR: No healthchecks found"
    ERRORS=$((ERRORS + 1))
fi

# Check networks
echo ""
echo "🌐 Checking network configuration..."
if grep -q "networks:" docker-compose.yml && grep -q "fz152_network" docker-compose.yml; then
    echo "✅ Custom network 'fz152_network' configured"
else
    echo "⚠️  WARNING: Custom network not configured (using default)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check volumes
echo ""
echo "💾 Checking volume configuration..."
if grep -q "volumes:" docker-compose.yml && grep -q "pgdata" docker-compose.yml; then
    echo "✅ PostgreSQL data volume configured"
else
    echo "❌ ERROR: PostgreSQL data volume not configured"
    ERRORS=$((ERRORS + 1))
fi

# Check environment variables
echo ""
echo "🔐 Checking environment variable handling..."
if grep -q '\${DB_USER:-' docker-compose.yml && grep -q '\${DB_PASSWORD:-' docker-compose.yml; then
    echo "✅ Environment variables with defaults configured"
else
    echo "⚠️  WARNING: Environment variables may not have defaults"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "backend/.env.example" ]; then
    echo "✅ backend/.env.example exists"
else
    echo "❌ ERROR: backend/.env.example not found"
    ERRORS=$((ERRORS + 1))
fi

# Check ports
echo ""
echo "🔌 Checking port configuration..."
if grep -q '"3000:3000"' docker-compose.yml; then
    echo "✅ Backend port 3000 mapped"
else
    echo "❌ ERROR: Backend port 3000 not mapped"
    ERRORS=$((ERRORS + 1))
fi

if grep -q '"5173:5173"' docker-compose.yml; then
    echo "✅ Frontend port 5173 mapped"
else
    echo "❌ ERROR: Frontend port 5173 not mapped"
    ERRORS=$((ERRORS + 1))
fi

# Check depends_on with conditions
echo ""
echo "🔗 Checking service dependencies..."
if grep -A3 "depends_on:" docker-compose.yml | grep -q "condition: service_healthy"; then
    echo "✅ Health-based dependencies configured"
else
    echo "⚠️  WARNING: Health-based dependencies may not be configured"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Prisma schema
echo ""
echo "📊 Checking Prisma schema..."
if [ -f "backend/prisma/schema.prisma" ]; then
    if grep -q "provider = \"postgresql\"" backend/prisma/schema.prisma; then
        echo "✅ Prisma configured for PostgreSQL"
    else
        echo "❌ ERROR: Prisma not configured for PostgreSQL"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "model User" backend/prisma/schema.prisma; then
        echo "✅ User model defined"
    else
        echo "❌ ERROR: User model not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "model DocumentRequest" backend/prisma/schema.prisma; then
        echo "✅ DocumentRequest model defined"
    else
        echo "❌ ERROR: DocumentRequest model not found"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ ERROR: backend/prisma/schema.prisma not found"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "========================================"
echo "📊 VALIDATION SUMMARY"
echo "========================================"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ VALIDATION PASSED - All critical checks successful!"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  Note: $WARNINGS warning(s) found. Review recommended."
    fi
    exit 0
else
    echo "❌ VALIDATION FAILED - $ERRORS error(s) must be fixed"
    exit 1
fi
