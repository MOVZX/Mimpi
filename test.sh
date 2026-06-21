#!/usr/bin/env bash

# ============================================================
# Mimpi - Test Runner
# Runs all Python and TypeScript tests
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_VENV="$SCRIPT_DIR/.venv"
TS_DIR="$SCRIPT_DIR/mimpi"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================================"
echo "  Mimpi Test Runner"
echo "============================================================"
echo ""

# ============================================================
# Check Prerequisites
# ============================================================
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Python venv
if [ ! -d "$PYTHON_VENV" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv "$PYTHON_VENV"
fi

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
"$PYTHON_VENV/bin/pip" install -r "$SCRIPT_DIR/requirements.txt" --quiet
"$PYTHON_VENV/bin/pip" install pytest pytest-asyncio --quiet

# Check TypeScript dependencies
if [ ! -d "$TS_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing TypeScript dependencies...${NC}"
    cd "$TS_DIR" && npm install --silent
fi

echo ""

# ============================================================
# Run Python Tests
# ============================================================
echo -e "${BLUE}Running Python Tests...${NC}"
echo "------------------------------------------------------------"

# Set up environment for tests
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

# Run pytest with verbose output
"$PYTHON_VENV/bin/pytest" \
    "$SCRIPT_DIR/server/tests/" \
    -v \
    --tb=short \
    --color=yes \
    2>&1

PYTHON_EXIT=$?

echo ""

# ============================================================
# Run TypeScript Tests
# ============================================================
echo -e "${BLUE}Running TypeScript Tests...${NC}"
echo "------------------------------------------------------------"

cd "$TS_DIR"

# Check if jest is installed
if [ ! -f "./node_modules/.bin/jest" ]; then
    echo -e "${YELLOW}Installing Jest for testing...${NC}"
    npm install --save-dev jest ts-jest @types/jest @types/node @testing-library/jest-dom --silent 2>/dev/null
fi

# Run TypeScript tests if they exist
TS_EXIT=0
if [ -d "src/tests" ] || [ -d "tests" ]; then
    if command -v jest &> /dev/null; then
        jest --verbose --coverage=false
        TS_EXIT=$?
    elif [ -f "./node_modules/.bin/jest" ]; then
        ./node_modules/.bin/jest --verbose --coverage=false
        TS_EXIT=$?
    else
        echo -e "${RED}Jest not found. Please install it: npm install --save-dev jest${NC}"
        TS_EXIT=1
    fi
else
    echo -e "${YELLOW}No TypeScript tests found in src/tests or tests directory${NC}"
    echo -e "${YELLOW}To add TypeScript tests, create files in src/tests/ with .test.ts extension${NC}"
    TS_EXIT=0
fi

echo ""

# ============================================================
# Summary
# ============================================================
echo "============================================================"
echo "  Test Summary"
echo "============================================================"

if [ $PYTHON_EXIT -eq 0 ]; then
    echo -e "  ${GREEN}✓ Python tests passed${NC}"
else
    echo -e "  ${RED}✗ Python tests failed${NC}"
fi

if [ $TS_EXIT -eq 0 ]; then
    echo -e "  ${GREEN}✓ TypeScript tests passed${NC}"
else
    echo -e "  ${RED}✗ TypeScript tests failed${NC}"
fi

echo ""

# Exit with appropriate code
if [ $PYTHON_EXIT -ne 0 ] || [ $TS_EXIT -ne 0 ]; then
    exit 1
fi

echo -e "${GREEN}All tests passed!${NC}"
exit 0
