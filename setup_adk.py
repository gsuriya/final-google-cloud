#!/usr/bin/env python3
"""
Setup script for Fashion ADK API
This script helps set up the environment and dependencies for the fashion stylist ADK API.
"""

import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("Python 3.8+ is required for Google ADK")
        return False
    logger.info(f"Python version {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install required dependencies"""
    try:
        logger.info("Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False

def check_google_cloud_auth():
    """Check if Google Cloud is authenticated"""
    try:
        result = subprocess.run(["gcloud", "auth", "list"], capture_output=True, text=True)
        if "ACTIVE" in result.stdout:
            logger.info("Google Cloud authentication found")
            return True
        else:
            logger.warning("No active Google Cloud authentication found")
            logger.info("Run: gcloud auth login")
            logger.info("And: gcloud auth application-default login")
            return False
    except FileNotFoundError:
        logger.error("gcloud CLI not found. Please install Google Cloud SDK")
        return False

def check_environment_variables():
    """Check required environment variables"""
    required_vars = ["GOOGLE_CLOUD_PROJECT"]
    missing_vars = []

    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
        logger.info("Create a .env file with:")
        for var in missing_vars:
            if var == "GOOGLE_CLOUD_PROJECT":
                logger.info(f"{var}=your-google-cloud-project-id")
            else:
                logger.info(f"{var}=your-value-here")
        return False

    logger.info("All required environment variables are set")
    return True

def create_env_file():
    """Create a .env file template"""
    env_content = """# Google Cloud Configuration for ADK
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Optional: If using service account instead of gcloud auth
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Next.js Frontend Configuration
NEXT_PUBLIC_ADK_BASE_URL=http://localhost:8000
"""

    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write(env_content)
        logger.info("Created .env file template. Please update it with your values.")
    else:
        logger.info(".env file already exists")

def main():
    """Main setup function"""
    logger.info("🎉 Setting up Fashion ADK API...")

    success = True

    # Check Python version
    if not check_python_version():
        success = False

    # Install dependencies
    if not install_dependencies():
        success = False

    # Create .env file
    create_env_file()

    # Check Google Cloud auth
    if not check_google_cloud_auth():
        logger.warning("Google Cloud authentication not set up properly")

    # Check environment variables
    if not check_environment_variables():
        logger.warning("Environment variables not configured properly")

    if success:
        logger.info("✅ Setup completed! You can now run:")
        logger.info("   python main.py")
        logger.info("   or")
        logger.info("   uvicorn main:app --host 0.0.0.0 --port 8000")
    else:
        logger.error("❌ Setup encountered issues. Please fix them before running the server.")

if __name__ == "__main__":
    main()
