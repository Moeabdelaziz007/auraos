#!/bin/bash

# ==============================================================================
#  Master Script for AuraOS Quality Assurance
# ==============================================================================
#
#  This script runs a comprehensive suite of checks to ensure project quality,
#  including tests and multiple AI-powered code analyses via Cursor CLI.
#
#  Usage:
#    ./scripts/run-all-checks.sh
#
# ==============================================================================

set -e

# --- Configuration ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Helper Functions ---
print_header() {
    echo -e "\n${BLUE}=======================================================================${NC}"
    echo -e "${BLUE}  $1"
    echo -e "${BLUE}=======================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# --- Main Execution ---

print_header "Starting Comprehensive Quality Checks for AuraOS"

# 1. Run All Project Tests
print_header "Phase 1: Running All Project Tests"
if [ -f "package.json" ]; then
    # Assuming `npm test` is configured to run all test suites
    # (e.g., test:zentixai, test:cursor-cli, test:comprehensive)
    if npm test; then
        print_success "All tests passed successfully."
    else
        print_error "One or more tests failed. Please review the output above."
        exit 1
    fi
else
    print_error "Root package.json not found. Cannot run tests."
    exit 1
fi

# 2. Run Comprehensive Code Analysis using Cursor CLI
print_header "Phase 2: Running Comprehensive Code Analysis"
if [ -f "scripts/cursor-analysis.sh" ]; then
    chmod +x scripts/cursor-analysis.sh
    if ./scripts/cursor-analysis.sh analyze; then
        print_success "Comprehensive code analysis completed."
    else
        print_error "Comprehensive analysis failed. Please check the generated report."
        exit 1
    fi
else
    print_error "Analysis script 'scripts/cursor-analysis.sh' not found."
    exit 1
fi

print_header "All Quality Checks Completed Successfully!"
print_success "AuraOS project is stable, tested, and analyzed."