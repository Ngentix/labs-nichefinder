# Context: PEG v2 Connector Generation for NicheFinder Demo

## Mission
We need to successfully generate and load three PEG v2 connectors (HACS, GitHub, Reddit) into the PEG-Connector-Service so we can create PEG workflows for the NicheFinder demo.

## Current Status

### What's Working
1. PEG-Connector-Service is running on port 9004 (terminal ID 36)
2. UDM Server is running on port 3001 (terminal ID 18)
3. Infrastructure services are running: PostgreSQL (5433), Redis (6380), ChromaDB (8000)
4. Three connector YAML files exist at connectors/peg-v2-{hacs,github,reddit}.yaml
5. Files are copied to deps/PEG-Connector-Service/connectors-peg-v2/

### Current Problem
The connectors are failing to load with this error:

WARN peg_connector_service::registry::peg_v2_service: Failed to load PEG v0.2 connector from "connectors-peg-v2/peg-v2-github.yaml": Internal error: Failed to parse PEG v0.2 YAML from "connectors-peg-v2/peg-v2-github.yaml": adapter_interface: missing field security at line 22 column 3

The same error occurs for all three connectors (HACS, GitHub, Reddit).

### What We've Already Added
- Basic PEG v2 structure (schema_version, system_id, etc.)
- PEG capabilities section
- Adapter interface with performance section
- Adapter interface with compliance section (just added)
- Adapter interface with limits section
- Adapter interface with error_handling section
- Node types
- Action mappings
- Connection configuration

### What's Missing
The adapter_interface section is missing the security field (and possibly other required fields).

## Reference Files

### Working Example
deps/PEG-Connector-Service/connectors-peg-v2/peg-v2-stripe.yaml - A complete, working PEG v2 connector

### Our Connector Files (Need Fixing)
- connectors/peg-v2-hacs.yaml (100 lines)
- connectors/peg-v2-github.yaml (150 lines)
- connectors/peg-v2-reddit.yaml (150 lines)

### Key Locations
- PEG-Connector-Service: deps/PEG-Connector-Service/ (alpha branch, cloned from GitHub)
- Connector directory: deps/PEG-Connector-Service/connectors-peg-v2/ (where v2 connectors are loaded from)
- Config file: deps/PEG-Connector-Service/config.yaml

## Task

1. Investigate the complete schema requirements by examining deps/PEG-Connector-Service/connectors-peg-v2/peg-v2-stripe.yaml
2. Identify all missing required fields in the adapter_interface section (especially security)
3. Update all three connector files (connectors/peg-v2-{hacs,github,reddit}.yaml) with the missing fields
4. Copy the updated files to deps/PEG-Connector-Service/connectors-peg-v2/
5. Restart PEG-Connector-Service (kill terminal 36, restart with same command)
6. Verify the connectors load successfully by checking the logs for "PEG v0.2 connector loading complete: 23 loaded" (20 existing + 3 new)

## Important Notes

- The PEG v2 schema is strict and requires many fields
- Use the Stripe connector as the authoritative reference for the complete schema
- After updating the files in connectors/, they must be copied to deps/PEG-Connector-Service/connectors-peg-v2/
- The service must be restarted to load the new connectors
- Check the startup logs carefully for any remaining validation errors

## Commands Reference

Restart PEG-Connector-Service:
Kill terminal 36 first, then run: cd deps/PEG-Connector-Service && RUST_LOG=info cargo run --bin peg-connector-service -- --config config.yaml 2>&1

Copy connectors:
cp connectors/peg-v2-*.yaml deps/PEG-Connector-Service/connectors-peg-v2/

Check if connectors loaded:
Look for this in the logs: INFO peg_connector_service::registry::peg_v2_service: PEG v0.2 connector loading complete: 23 loaded

## Success Criteria
All three connectors (HACS, GitHub, Reddit) load successfully without errors, bringing the total PEG v0.2 connectors from 20 to 23.

## Next Steps After Success
Once the connectors are loading successfully, the next phase is to create PEG workflows that use these connectors to collect data for the NicheFinder demo.

