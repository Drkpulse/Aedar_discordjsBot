#!/bin/bash

# Get the directory of the bot (parent directory of src)
BOT_DIR="$(dirname "$(dirname "$0")")"
cd "$BOT_DIR"

# Check if the directory is a Git repository
if [ ! -d ".git" ]; then
    echo "Error: Not a Git repository."
    exit 1
fi

echo "Current directory: $(pwd)"
echo "Updating from Git repository..."

# Pull the latest changes from the remote repository
git pull

# Check if the pull was successful
if [ $? -eq 0 ]; then
    echo "Repository updated successfully!"

    # Install any new dependencies
    echo "Installing dependencies..."
    npm install --no-fund --no-audit --silent

    echo "Bot update completed successfully!"
    # The bot will be restarted by the JavaScript code
else
    echo "Error: Failed to update repository."
    exit 1
fi
