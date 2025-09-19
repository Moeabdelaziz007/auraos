#!/bin/bash

# Cursor CLI Analysis Script for AuraOS
# This script provides convenient commands for running Cursor CLI analysis

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MODEL="gpt-4"
VERBOSE=false
OUTPUT_DIR="./cursor-reports"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  analyze       Run comprehensive code analysis"
    echo "  review        Run code review on recent changes"
    echo "  security      Perform security audit"
    echo "  performance   Analyze performance issues"
    echo "  test          Review test coverage and quality"
    echo "  docs          Generate/update documentation"
    echo "  custom PROMPT Run custom analysis with provided prompt"
    echo ""
    echo "Options:"
    echo "  -m, --model MODEL    AI model to use (default: gpt-4)"
    echo "  -v, --verbose        Enable verbose output"
    echo "  -o, --output DIR     Output directory (default: ./cursor-reports)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 analyze"
    echo "  $0 security -m gpt-4"
    echo "  $0 custom \"Review the authentication system for vulnerabilities\""
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if cursor CLI is installed
    if ! command -v cursor &> /dev/null; then
        print_error "Cursor CLI is not installed. Please install it first:"
        echo "  curl https://cursor.com/install -fsS | bash"
        exit 1
    fi
    
    # Check if API key is set
    if [ -z "$CURSOR_API_KEY" ]; then
        print_error "CURSOR_API_KEY environment variable is not set"
        echo "Please set your Cursor API key:"
        echo "  export CURSOR_API_KEY=your_api_key_here"
        exit 1
    fi
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    print_success "Prerequisites check passed"
}

# Function to run analysis
run_analysis() {
    local command=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$OUTPUT_DIR/cursor_analysis_${command}_${timestamp}.md"
    
    print_status "Running $command analysis..."
    print_status "Model: $MODEL"
    print_status "Output: $output_file"
    
    case $command in
        "analyze")
            cursor-agent -p "Analyze this AuraOS codebase comprehensively:

1. **Code Quality Assessment**
   - Identify code smells and anti-patterns
   - Check for proper error handling
   - Review code organization and structure
   - Assess maintainability and readability

2. **Security Analysis**
   - Check for common vulnerabilities (OWASP Top 10)
   - Review authentication and authorization
   - Validate input sanitization
   - Check for sensitive data exposure
   - Review dependency security

3. **Performance Optimization**
   - Identify performance bottlenecks
   - Check for memory leaks
   - Review database query efficiency
   - Analyze bundle size and loading times
   - Check for unnecessary re-renders

4. **Architecture Review**
   - Evaluate system architecture
   - Check for proper separation of concerns
   - Review API design and structure
   - Assess scalability considerations

5. **Best Practices Compliance**
   - Check TypeScript/JavaScript best practices
   - Review React/UI component patterns
   - Validate testing practices
   - Check documentation quality

Provide actionable recommendations with priority levels (Critical, High, Medium, Low)." --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        "review")
            cursor-agent -p "Review the recent changes in this AuraOS repository:

1. **Change Analysis**
   - Review git diff and recent commits
   - Identify potential breaking changes
   - Check for regression risks
   - Validate feature implementation

2. **Code Review Focus**
   - Check code style consistency
   - Verify proper error handling
   - Review security implications
   - Validate performance impact

3. **Testing Coverage**
   - Check if new features are properly tested
   - Review test quality and coverage
   - Identify missing edge cases
   - Validate test structure

4. **Documentation Updates**
   - Check if documentation needs updates
   - Review API documentation changes
   - Validate README updates
   - Check for breaking change documentation

Provide detailed feedback with specific file references and line numbers where possible." --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        "security")
            cursor-agent -p "Perform a comprehensive security audit of the AuraOS system:

1. **Authentication & Authorization**
   - Review login/logout mechanisms
   - Check session management
   - Validate access control implementation
   - Review password policies and storage

2. **Input Validation & Sanitization**
   - Check all user inputs are validated
   - Review SQL injection prevention
   - Validate XSS protection
   - Check CSRF protection

3. **Data Protection**
   - Review sensitive data handling
   - Check encryption implementation
   - Validate data transmission security
   - Review data storage security

4. **API Security**
   - Check API endpoint security
   - Review rate limiting implementation
   - Validate API authentication
   - Check for information disclosure

5. **Dependency Security**
   - Review third-party dependencies
   - Check for known vulnerabilities
   - Validate dependency updates
   - Review license compliance

6. **Infrastructure Security**
   - Review deployment configurations
   - Check environment variable handling
   - Validate secret management
   - Review logging and monitoring

Provide a security assessment with severity ratings and remediation steps." --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        "performance")
            cursor-agent -p "Analyze and optimize performance of the AuraOS application:

1. **Frontend Performance**
   - Analyze bundle size and composition
   - Check for unnecessary dependencies
   - Review component rendering optimization
   - Check for memory leaks in React components
   - Analyze loading times and resource usage

2. **Backend Performance**
   - Review database query efficiency
   - Check for N+1 query problems
   - Analyze API response times
   - Review caching strategies
   - Check for memory leaks in server code

3. **Network Performance**
   - Analyze API call efficiency
   - Check for redundant requests
   - Review data transfer optimization
   - Check for proper compression
   - Analyze CDN usage

4. **Resource Optimization**
   - Review image optimization
   - Check for unused code elimination
   - Analyze lazy loading implementation
   - Review code splitting strategies
   - Check for proper caching headers

5. **Scalability Considerations**
   - Review horizontal scaling potential
   - Check for bottlenecks
   - Analyze database scaling
   - Review caching strategies
   - Check for proper async handling

Provide specific performance metrics and optimization recommendations." --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        "test")
            cursor-agent -p "Review and improve the test suite for AuraOS:

1. **Test Coverage Analysis**
   - Identify areas with low test coverage
   - Check for missing unit tests
   - Review integration test coverage
   - Analyze end-to-end test gaps

2. **Test Quality Assessment**
   - Review test structure and organization
   - Check for test best practices
   - Validate test readability and maintainability
   - Review test naming conventions

3. **Test Scenarios**
   - Check for edge case coverage
   - Review error scenario testing
   - Validate boundary condition tests
   - Check for regression test coverage

4. **Testing Tools and Setup**
   - Review testing framework configuration
   - Check for proper mocking strategies
   - Validate test environment setup
   - Review CI/CD test integration

5. **Performance Testing**
   - Check for performance test coverage
   - Review load testing scenarios
   - Validate stress testing implementation
   - Check for monitoring and alerting

Provide recommendations for improving test coverage and quality." --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        "docs")
            cursor-agent -p "Generate and update documentation for AuraOS:

1. **API Documentation**
   - Document all API endpoints
   - Provide usage examples
   - Include parameter descriptions
   - Add response format documentation

2. **Component Documentation**
   - Document React components
   - Provide usage examples
   - Include prop descriptions
   - Add styling guidelines

3. **Setup and Installation**
   - Update installation instructions
   - Document environment setup
   - Provide configuration examples
   - Add troubleshooting guides

4. **Architecture Documentation**
   - Document system architecture
   - Create component diagrams
   - Explain data flow
   - Document design decisions

5. **Development Guidelines**
   - Update coding standards
   - Document contribution process
   - Provide development setup guide
   - Add deployment instructions

Generate comprehensive, up-to-date documentation with examples and clear instructions." --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        "custom")
            if [ -z "$2" ]; then
                print_error "Custom prompt is required for custom command"
                echo "Usage: $0 custom \"Your custom prompt here\""
                exit 1
            fi
            cursor-agent -p "$2" --model "$MODEL" > "$output_file" 2>&1
            ;;
            
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "Analysis completed successfully!"
        print_status "Results saved to: $output_file"
        
        # Show summary if verbose
        if [ "$VERBOSE" = true ]; then
            echo ""
            echo "=== Analysis Summary ==="
            head -20 "$output_file"
            echo "..."
            echo "Full report: $output_file"
        fi
    else
        print_error "Analysis failed. Check the output file for details: $output_file"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--model)
            MODEL="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        analyze|review|security|performance|test|docs|custom)
            COMMAND="$1"
            if [ "$1" = "custom" ]; then
                CUSTOM_PROMPT="$2"
                shift 2
            else
                shift
            fi
            break
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if command is provided
if [ -z "$COMMAND" ]; then
    print_error "Command is required"
    show_usage
    exit 1
fi

# Main execution
print_status "Starting Cursor CLI Analysis for AuraOS"
print_status "Command: $COMMAND"

check_prerequisites

if [ "$COMMAND" = "custom" ]; then
    run_analysis "custom" "$CUSTOM_PROMPT"
else
    run_analysis "$COMMAND"
fi

print_success "Cursor CLI analysis completed!"
