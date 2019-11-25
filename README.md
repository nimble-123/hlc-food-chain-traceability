# food-chain-traceability

A Business Network to support the food traceability.

### [Changelog](CHANGELOG.md)

## Getting Started

### Set up Fabric Dev Network
#### Prerequisites
- git clone fabric samples
- install binaries
- change branch to multi-org
- generate crypto material
- start up fabric network

#### Set up Fabric access
- create temp dir
- create connection profile
- replace certificate placeholder
- derive org connection profiles
- copy crypto material to temp dir
- create business network cards for org admins
- import business network cards

### Set up Composer project
- git clone this repo
- inspect model, logic, queries & permissions

### Build Business Network Archive
- run tests
- build archive

### Deploy to Fabric Dev Network
#### Deploy Smart Contracts
- install business network archive (chaincode) on peers
- define endorsement policy
- retrieve certificates for business network admins
- start business network

#### Set up user access
- create business network cards for business network admins
- add participant entity
- create identity for business network participant
- bind identity to business network participant
- import business network card of business network participant/identity
- smoke test

#### Issue test transaction
- submit transaction as business network participant/identity
- confirm transaction processing

---

### To Do

- [ ] Write tests
- [ ] Write jsDoc
- [ ] Write `Getting Started`
