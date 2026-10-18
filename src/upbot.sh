#!/bin/bash

# Navigate to the root of the Git repository (the folder above this script)
cd "$(dirname "$0")/.." || exit 1

# Check if the directory is a Git repository
if [ ! -d ".git" ]; then
	echo "Error: Not a Git repository."
	exit 1
fi

# Pull the latest changes from the remote repository
git pull

# Check if the pull was successful
if [ $? -eq 0 ]; then
	echo "Repository updated successfully."

	# Install dependencies, build with CommandKit and start the bot
	npm install && npm run build && npm start
else
	echo "Error: Failed to update repository."
fi
