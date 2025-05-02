#!/bin/bash

# Navigate to the directory containing the Git repository
cd ..

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

	# Start nodemon
	# echo "Starting nodemon..."
	node . # Replace app.js with your main Node.js file
else
	echo "Error: Failed to update repository."
fi
