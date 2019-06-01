/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */
'use strict';

const NS = 'io.dev.foodchain';

/**
 * UUID helper function
 * @returns {string} generated pseudo UUID string
 */
function uuid() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

/**
 * GLN helper function
 * @returns {string} generated pseudo GLN string
 */
function gln() {
    const n6 = () => Math.floor(100000 + Math.random() * 900000);
    return `${n6()}`;
}

/**
 * Transaction
 * @param {io.dev.foodchain.verarbeiteSchwein} tx
 * @transaction
 */
async function verarbeiteSchwein(tx) {
    // pre-checks
    const material = tx.material;
    const materialRegistry = await getAssetRegistry(NS + '.Material');
    const materialExists = await materialRegistry.exists(material.materialId);
    if(!materialExists) {
        throw new Error('Material does not exists in registry.');
    }

    // material split process according to business rules
    let newMaterial1 = await getFactory().newResource(NS, 'Material', uuid());
    let newMaterial2 = await getFactory().newResource(NS, 'Material', uuid());

    newMaterial1.type = 'SCHWEINEHAELFTE';
    //newMaterial1.owner = getCurrentParticipant();
    newMaterial2.type = 'SCHWEINEHAELFTE';
    //newMaterial2.owner = getCurrentParticipant();

    await materialRegistry.addAll([newMaterial1, newMaterial2]);

    // event emitting

}

/**
 * Generate mock master data helper function
 * @param {io.dev.foodchain.generateMockMasterData} generateMockMasterData - generateMockMasterData instance
 * @transaction
 */
async function generateMockMasterData() {
    const factory = getFactory();

    const farmers = [
        factory.newResource(NS, 'Farmer', gln())
    ];

    const slaughterhouses = [
        factory.newResource(NS, 'Slaughterhouse', gln())
    ];

    const cuttingplants = [
        factory.newResource(NS, 'CuttingPlant', gln())
    ];

    const manufacturers = [
        factory.newResource(NS, 'Manufacturer', gln())
    ];

    const wholesales = [
        factory.newResource(NS, 'Wholesale', gln())
    ];

    const retailers = [
        factory.newResource(NS, 'Retailer', gln())
    ];

    const consumers = [
        factory.newResource(NS, 'Consumer', 'Consumer_1')
    ];

    farmers.forEach(function(farmer, index) {
        farmer.name = 'FARMER_' + (index + 1);
        const address = factory.newConcept(NS, 'Address');
        address.street = 'STREET_' + (index + 1);
        address.number =  'N_' + (index + 1);
        address.postCode = 'POSTCODE_' + (index + 1);
        address.country = 'COUNTRY_' + (index + 1);
        farmer.address = address;
        farmer.type = 'LANDWIRT';

    });
    const farmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    await farmerRegistry.addAll(farmers);

    slaughterhouses.forEach(function(slaughterhouse, index) {
        slaughterhouse.name = 'SLAUGHTERHOUSE_' + (index + 1);
        const address = factory.newConcept(NS, 'Address');
        address.street = 'STREET_' + (index + 1);
        address.number =  'N_' + (index + 1);
        address.postCode = 'POSTCODE_' + (index + 1);
        address.country = 'COUNTRY_' + (index + 1);
        slaughterhouse.address = address;
        slaughterhouse.type = 'SCHLACHTHOF';
    });
    const slaughterhouseRegistry = await getParticipantRegistry(NS + '.Slaughterhouse');
    await slaughterhouseRegistry.addAll(slaughterhouses);

    cuttingplants.forEach(function(cuttingplant, index) {
        cuttingplant.name = 'CUTTING_PLANT_' + (index + 1);
        const address = factory.newConcept(NS, 'Address');
        address.street = 'STREET_' + (index + 1);
        address.number =  'N_' + (index + 1);
        address.postCode = 'POSTCODE_' + (index + 1);
        address.country = 'COUNTRY_' + (index + 1);
        cuttingplant.address = address;
        cuttingplant.type = 'ZERLEGUNG';
    });
    const cuttingPlantRegistry = await getParticipantRegistry(NS + '.CuttingPlant');
    await cuttingPlantRegistry.addAll(cuttingplants);

    manufacturers.forEach(function(manufacturer, index) {
        manufacturer.name = 'MANUFACTURER_' + (index + 1);
        const address = factory.newConcept(NS, 'Address');
        address.street = 'STREET_' + (index + 1);
        address.number =  'N_' + (index + 1);
        address.postCode = 'POSTCODE_' + (index + 1);
        address.country = 'COUNTRY_' + (index + 1);
        manufacturer.address = address;
        manufacturer.type = 'PRODUKTION';
    });
    const manufacturerRegistry = await getParticipantRegistry(NS + '.Manufacturer');
    await manufacturerRegistry.addAll(manufacturers);

    wholesales.forEach(function(wholesale, index) {
        wholesale.name = 'WHOLESALE_' + (index + 1);
        const address = factory.newConcept(NS, 'Address');
        address.street = 'STREET_' + (index + 1);
        address.number =  'N_' + (index + 1);
        address.postCode = 'POSTCODE_' + (index + 1);
        address.country = 'COUNTRY_' + (index + 1);
        wholesale.address = address;
        wholesale.type = 'GROSSHANDEL';
    });
    const wholesalesRegistry = await getParticipantRegistry(NS + '.Wholesale');
    await wholesalesRegistry.addAll(wholesales);

    retailers.forEach(function(retailer, index) {
        retailer.name = 'RETAILER_' + (index + 1);
        const address = factory.newConcept(NS, 'Address');
        address.street = 'STREET_' + (index + 1);
        address.number =  'N_' + (index + 1);
        address.postCode = 'POSTCODE_' + (index + 1);
        address.country = 'COUNTRY_' + (index + 1);
        retailer.address = address;
        retailer.type = 'EINZELHANDEL';
    });
    const retailerRegistry = await getParticipantRegistry(NS + '.Retailer');
    await retailerRegistry.addAll(retailers);
}

/**
 * Generate mock transactional data helper function
 * @param {io.dev.foodchain.generateMockTransactionData} generateMockTransactionData - generateMockTransactionData instance
 * @transaction
 */
async function generateMockTransactionData() {
    const factory = getFactory();
    const farmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    const farmers = await farmerRegistry.getAll();

    const materials = [
        factory.newResource(NS, 'Material', uuid()),
        factory.newResource(NS, 'Material', uuid()),
        factory.newResource(NS, 'Material', uuid())
    ];

    const materialTypes = [
        'SCHWEIN',
        'SCHWEINEHAELFTE',
        'KOPF',
        'RUECKEN',
        'VORDERKEULE',
        'RUMPF',
        'HINTERKEULE',
        'SALAMI',
        'BRATWURST',
    ];

    const materialQualities = [
        'LOW',
        'MID',
        'HIGH'
    ];

    const materialStatuses = [
        'REGISTRIERT',
        'IN_TRANSIT',
        'VERARBEITET'
    ];

    const batches = [
        factory.newResource(NS, 'Batch', uuid())
    ];

    const batchNetworks = [
        factory.newResource(NS, 'BatchNetwork', uuid())
    ];

    materials.forEach(function(material, index) {
        material.type = materialTypes[0];
        material.quality = materialQualities[Math.floor(Math.random() * Math.floor(3))];
        material.bonus = Math.round(Math.random()) === 0 ? true : false;
        material.status = materialStatuses[Math.floor(Math.random() * Math.floor(3))];
        material.owner = factory.newRelationship(NS, 'Farmer', farmers[Math.floor(Math.random() * Math.floor(farmers.length))].getIdentifier());
        material.ownerHistory = [
            material.owner
        ];
        material.transportLog = [];
        material.sensorData = [];
    });
    const materialRegistry = await getAssetRegistry(NS + '.Material');
    await materialRegistry.addAll(materials);

    batches.forEach(function(batch, index) {
        batch.timestamp = new Date();
        materials.forEach(function(material, index) {
            batch.addArrayValue('materials', factory.newRelationship(NS, 'Material', material.getIdentifier()));
        });
        batch.description = 'Batch Description ' + (index + 1);
    });
    const batchRegistry = await getAssetRegistry(NS + '.Batch');
    await batchRegistry.addAll(batches);

    batchNetworks.forEach(function(batchNetwork, index) {
        batchNetwork.description = 'Batch Network Description ' + (index + 1);
        batches.forEach(function(batch, index) {
            batchNetwork.addArrayValue('nodes', factory.newRelationship(NS, 'Batch', batch.getIdentifier()));
        });
        const edges = [];
        batchNetwork.edges = edges;
    });
    const batchNetworkRegistry = await getAssetRegistry(NS + '.BatchNetwork');
    await batchNetworkRegistry.addAll(batchNetworks);
}

/**
 * Remove generated mock master data
 * @param {io.dev.foodchain.removeMockMasterData} removeMockMasterData - removeMockMasterData instance
 * @transaction
 */
async function removeMockMasterData(removeMockMasterData) { // eslint-disable-line no-unused-vars
    const farmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    const slaughterhouseRegistry = await getParticipantRegistry(NS + '.Slaughterhouse');
    const cuttingplantRegistry = await getParticipantRegistry(NS + '.CuttingPlant');
    const manufacturerRegistry = await getParticipantRegistry(NS + '.Manufacturer');
    const wholesaleRegistry = await getParticipantRegistry(NS + '.Wholesale');
    const retailerRegistry = await getParticipantRegistry(NS + '.Retailer');
    const consumerRegistry = await getParticipantRegistry(NS + '.Consumer');

    await farmerRegistry.removeAll(await farmerRegistry.getAll());
    await slaughterhouseRegistry.removeAll(await slaughterhouseRegistry.getAll());
    await cuttingplantRegistry.removeAll(await cuttingplantRegistry.getAll());
    await manufacturerRegistry.removeAll(await manufacturerRegistry.getAll());
    await wholesaleRegistry.removeAll(await wholesaleRegistry.getAll());
    await retailerRegistry.removeAll(await retailerRegistry.getAll());
    await consumerRegistry.removeAll(await consumerRegistry.getAll());
}

/**
 * Remove generated mock transactional data
 * @param {io.dev.foodchain.removeMockTransactionData} removeMockTransactionData - removeMockTransactionData instance
 * @transaction
 */
async function removeMockTransactionData(removeMockTransactionData) { // eslint-disable-line no-unused-vars
    const materialRegistry = await getAssetRegistry(NS + '.Material');
    const batchRegistry = await getAssetRegistry(NS + '.Batch');
    const batchNetworkRegistry = await getAssetRegistry(NS + '.BatchNetwork');

    await materialRegistry.removeAll(await materialRegistry.getAll());
    await batchRegistry.removeAll(await batchRegistry.getAll());
    await batchNetworkRegistry.removeAll(await batchNetworkRegistry.getAll());

}
