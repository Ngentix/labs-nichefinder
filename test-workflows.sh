#!/bin/bash

# Test script for PEG v2 workflows

echo "=== Testing PEG v2 Workflows for NicheFinder ==="
echo ""

# Test 1: HACS Fetch Integrations (no auth required - simplest test)
echo "Test 1: HACS Fetch Integrations"
echo "--------------------------------"

HACS_WORKFLOW=$(cat workflows/peg-v2-hacs-fetch-integrations.yaml)

curl -X POST "http://localhost:9004/api/v2/graphs/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"graph\": $(cat workflows/peg-v2-hacs-fetch-integrations.yaml | yq -o=json),
    \"profile\": \"Beta\",
    \"inputs\": {}
  }" | jq '.'

echo ""
echo ""

# Test 2: Validate GitHub workflow
echo "Test 2: Validate GitHub Search Workflow"
echo "----------------------------------------"

curl -X POST "http://localhost:9004/api/v2/graphs/validate" \
  -H "Content-Type: application/json" \
  -d "{
    \"graph\": $(cat workflows/peg-v2-github-search-repos.yaml | yq -o=json)
  }" | jq '.'

echo ""
echo ""

# Test 3: Validate Reddit workflow
echo "Test 3: Validate Reddit Search Workflow"
echo "----------------------------------------"

curl -X POST "http://localhost:9004/api/v2/graphs/validate" \
  -H "Content-Type: application/json" \
  -d "{
    \"graph\": $(cat workflows/peg-v2-reddit-search-subreddits.yaml | yq -o=json)
  }" | jq '.'

echo ""
echo "=== Tests Complete ==="

