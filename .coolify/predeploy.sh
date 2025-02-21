#!/bin/sh

echo "Starting predeploy script..."

# Install prerequisites
echo "Installing prerequisites..."
apt-get update && apt-get install -y wget gnupg

# Add Node.js repository using wget
echo "Adding Node.js repository..."
mkdir -p /etc/apt/keyrings
wget -qO- https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

# Install Node.js and npm
echo "Installing Node.js and npm..."
apt-get update
apt-get install -y nodejs

# Install Supabase CLI and run database push
echo "Running Supabase database push..."
cd apps && \
npx supabase db push --db-url $SUPABASE_DB_URL


echo "Returning to root directory..."
cd ../

echo "Predeploy script completed successfully!"