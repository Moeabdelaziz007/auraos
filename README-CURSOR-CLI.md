# Cursor CLI Integration for AuraOS

This document explains how to set up and use Cursor CLI with GitHub Actions in the AuraOS project.

## 🚀 Quick Start

### 1. Install Cursor CLI

```bash
# Install Cursor CLI
curl https://cursor.com/install -fsS | bash

# Add to PATH (add to your ~/.bashrc or ~/.zshrc)
echo 'export PATH="$HOME/.cursor/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
cursor --version
```

### 2. Set up API Key

```bash
# Set your Cursor API key
export CURSOR_API_KEY=your_api_key_here

# Or add to your shell profile
echo 'export CURSOR_API_KEY=your_api_key_here' >> ~/.bashrc
```

### 3. Run Analysis

```bash
# Make the script executable (if not already done)
chmod +x scripts/cursor-analysis.sh

# Run comprehensive analysis
./scripts/cursor-analysis.sh analyze

# Run security audit
./scripts/cursor-analysis.sh security

# Run performance analysis
./scripts/cursor-analysis.sh performance
```

## 📋 Available Commands

### Analysis Commands

| Command | Description |
|---------|-------------|
| `analyze` | Comprehensive code analysis (quality, security, performance) |
| `review` | Code review for recent changes |
| `security` | Security audit and vulnerability assessment |
| `performance` | Performance analysis and optimization |
| `test` | Test coverage and quality review |
| `docs` | Documentation generation and updates |
| `custom` | Run custom analysis with your prompt |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-m, --model` | AI model to use (gpt-4, gpt-3.5-turbo, etc.) | gpt-4 |
| `-v, --verbose` | Enable verbose output | false |
| `-o, --output` | Output directory for reports | ./cursor-reports |
| `-h, --help` | Show help message | - |

## 🔧 GitHub Actions Integration

### Setup

1. **Add Repository Secrets**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add a new repository secret named `CURSOR_API_KEY`
   - Set the value to your Cursor API key

2. **Workflow Triggers**
   - **Push to main/develop**: Automatic analysis on code changes
   - **Pull Requests**: Code review on PR creation/updates
   - **Manual Dispatch**: Run custom commands via GitHub UI

### Manual Workflow Execution

1. Go to Actions tab in your GitHub repository
2. Select "Cursor CLI Integration" workflow
3. Click "Run workflow"
4. Choose your options:
   - **Command**: analyze, review, security, performance, test, docs, custom
   - **Model**: gpt-4, gpt-3.5-turbo, etc.
   - **Custom Prompt**: (for custom command only)

### Workflow Features

- **Automated Analysis**: Runs on every push and PR
- **Multiple Commands**: Supports all analysis types
- **Report Generation**: Creates detailed markdown reports
- **Artifact Storage**: Saves analysis results for 30 days
- **GitHub Integration**: Creates issues and PR comments
- **Automated Improvements**: Can automatically apply fixes (manual trigger only)

## 📊 Analysis Types

### 1. Comprehensive Analysis (`analyze`)
- Code quality assessment
- Security vulnerability check
- Performance optimization
- Architecture review
- Best practices compliance

### 2. Code Review (`review`)
- Recent changes analysis
- Breaking change detection
- Code style validation
- Test coverage review
- Documentation updates

### 3. Security Audit (`security`)
- Authentication & authorization review
- Input validation check
- Data protection analysis
- API security assessment
- Dependency vulnerability scan
- Infrastructure security review

### 4. Performance Analysis (`performance`)
- Frontend performance optimization
- Backend performance review
- Network performance analysis
- Resource optimization
- Scalability considerations

### 5. Test Review (`test`)
- Test coverage analysis
- Test quality assessment
- Test scenario validation
- Testing tools review
- Performance testing check

### 6. Documentation (`docs`)
- API documentation generation
- Component documentation
- Setup and installation guides
- Architecture documentation
- Development guidelines

## 📁 Output Structure

```
cursor-reports/
├── cursor_analysis_analyze_20240101_120000.md
├── cursor_analysis_security_20240101_130000.md
├── cursor_analysis_performance_20240101_140000.md
└── ...
```

Each report includes:
- Executive summary
- Detailed findings
- Priority ratings (Critical, High, Medium, Low)
- Specific recommendations
- Code references with line numbers
- Actionable next steps

## 🔍 Example Usage

### Basic Analysis
```bash
# Run full analysis
./scripts/cursor-analysis.sh analyze

# Run with specific model
./scripts/cursor-analysis.sh analyze -m gpt-3.5-turbo

# Run with verbose output
./scripts/cursor-analysis.sh analyze -v
```

### Security Focus
```bash
# Security audit
./scripts/cursor-analysis.sh security

# Custom security prompt
./scripts/cursor-analysis.sh custom "Focus on authentication vulnerabilities in the login system"
```

### Performance Optimization
```bash
# Performance analysis
./scripts/cursor-analysis.sh performance

# Custom performance prompt
./scripts/cursor-analysis.sh custom "Analyze React component performance and suggest optimizations"
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required
export CURSOR_API_KEY=your_api_key_here

# Optional
export CURSOR_MODEL=gpt-4                    # Default model
export CURSOR_OUTPUT_DIR=./cursor-reports    # Output directory
export CURSOR_VERBOSE=true                   # Verbose logging
```

### Configuration File

The project includes a `.cursor-config.yml` file with:
- Default model settings
- Analysis configurations
- File inclusion/exclusion patterns
- Custom prompts for different scenarios
- Output format settings
- Integration configurations

## 🛠️ Troubleshooting

### Common Issues

1. **Cursor CLI not found**
   ```bash
   # Reinstall Cursor CLI
   curl https://cursor.com/install -fsS | bash
   export PATH="$HOME/.cursor/bin:$PATH"
   ```

2. **API Key not set**
   ```bash
   # Set your API key
   export CURSOR_API_KEY=your_api_key_here
   ```

3. **Permission denied**
   ```bash
   # Make script executable
   chmod +x scripts/cursor-analysis.sh
   ```

4. **GitHub Actions failing**
   - Check that `CURSOR_API_KEY` secret is set
   - Verify the workflow file is in `.github/workflows/`
   - Check the Actions tab for detailed error logs

### Debug Mode

```bash
# Run with debug output
./scripts/cursor-analysis.sh analyze -v

# Check prerequisites
./scripts/cursor-analysis.sh -h
```

## 📈 Best Practices

1. **Regular Analysis**: Run analysis on every major change
2. **Security First**: Run security audits before releases
3. **Performance Monitoring**: Check performance regularly
4. **Documentation**: Keep documentation updated
5. **Automated Integration**: Use GitHub Actions for CI/CD
6. **Review Reports**: Always review and act on findings
7. **Incremental Improvements**: Address issues gradually

## 🔗 Related Resources

- [Cursor CLI Documentation](https://docs.cursor.com/en/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AuraOS Project Documentation](./README.md)
- [Development Guidelines](./DEVELOPMENT.md)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the GitHub Actions logs
3. Check the Cursor CLI documentation
4. Create an issue in the repository

---

**Happy coding with Cursor CLI! 🚀**
