#!/bin/bash

FRONTEND_PKG="package.json"

# --- GET CURRENT VERSION ---
CUR_VERSION=$(grep -m1 -Eo '"version": *"([0-9]+\.[0-9]+\.[0-9]+)"' "$FRONTEND_PKG" | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')

if [ -z "$CUR_VERSION" ]; then
  echo "Could not determine current version!"
  exit 1
fi

# --- BUMP PATCH ---
IFS='.' read -r MAJOR MINOR PATCH <<< "$CUR_VERSION"
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo "Bumping version: $CUR_VERSION → $NEW_VERSION"

# --- UPDATE package.json ---
sed -i '' -E "s/\"version\": *\"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$NEW_VERSION\"/" "$FRONTEND_PKG"
git add "$FRONTEND_PKG"
echo "Frontend version bumped to $NEW_VERSION and staged for commit."