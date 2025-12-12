#!/bin/bash

# Test script for PEG v2 connectors - Direct action execution

echo "=== Testing PEG v2 Connectors for NicheFinder (Direct Action Execution) ==="
echo ""

# Test 1: List all PEG v2 connectors
echo "Test 1: List all PEG v2 connectors"
echo "-----------------------------------"
curl -s http://localhost:9004/api/v2/connectors | jq '.data[] | {system_id, system_name, category}'
echo ""
echo ""

# Test 2: Get HACS connector details
echo "Test 2: Get HACS connector details"
echo "-----------------------------------"
curl -s http://localhost:9004/api/v2/connectors/hacs | jq '.data | {system_id, system_name, actions: .node_types.action_mappings[].action_id}'
echo ""
echo ""

# Test 3: Execute HACS fetch_integrations action (no auth required)
echo "Test 3: Execute HACS fetch_integrations action"
echo "-----------------------------------------------"
curl -X POST http://localhost:9004/api/v2/connectors/hacs/actions/fetch_integrations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {},
    "credentials": {}
  }' | jq '.'
echo ""
echo ""

# Test 4: Get GitHub connector details
echo "Test 4: Get GitHub connector details"
echo "-------------------------------------"
curl -s http://localhost:9004/api/v2/connectors/github | jq '.data | {system_id, system_name, actions: .node_types.action_mappings[].action_id}'
echo ""
echo ""

# Test 5: Get Reddit connector details
echo "Test 5: Get Reddit connector details"
echo "-------------------------------------"
curl -s http://localhost:9004/api/v2/connectors/reddit | jq '.data | {system_id, system_name, actions: .node_types.action_mappings[].action_id}'
echo ""
echo ""

echo "=== Tests Complete ==="
echo ""
echo "Note: GitHub and Reddit actions require authentication tokens."
echo "To test them, you'll need to provide access tokens in the credentials field."

