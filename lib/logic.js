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

/*****************************************************************************/
/* Transaction processor functions                                           */
/*****************************************************************************/

/**
 * Produce material transaction
 * @param {io.dev.foodchain.produceMaterial} tx
 * @transaction
 */
async function produceMaterial(tx) {
    const oFactory = getFactory();

    // input parameter
    const oNewMaterial = tx.newMaterial;
    const aInputMaterial = tx.inputMaterial;
    const iInputMaterialCount = tx.inputMaterialCount;
    const aInputBatch = tx.inputBatch;
    const iInputBatchCount = tx.inputBatchCount;

    // checks
    //// check if proposed new material already exists
    const oMaterialRegistry = await getAssetRegistry(NS + '.Material');
    const bMaterialExists = await oMaterialRegistry.exists(oNewMaterial.getIdentifier());
    if(bMaterialExists) {
        throw new Error('Input material with key "' + oNewMaterial.materialId + '" already exists in registry.');
    }
    //// check if proposed input material exists
    if (aInputMaterial && aInputMaterial.length > 0) {
        for (const oInputMaterial of aInputMaterial) {
            const bMaterialExists = await oMaterialRegistry.exists(oInputMaterial.getIdentifier());
            if(!bMaterialExists) {
                throw new Error('Input material "' + oInputMaterial.materialId + '" does not exists in registry.');
            }
            //// AND belong to tx issuer
            if (oInputMaterial.owner !== getCurrentParticipant()) {
                throw new Error('You are not allowed to manipulate asset: "' + oInputMaterial.materialId + '".');
            }
        }
    }
    //// check if proposed input batch exists
    const oBatchRegistry = await getAssetRegistry(NS + '.Batch');
    if (aInputBatch && aInputBatch.length > 0) {
        for (const oInputBatch of aInputBatch) {
            const bBatchExists = await oBatchRegistry.exists(oInputBatch.getIdentifier());
            if(!bBatchExists) {
                throw new Error('Input batch "' + oInputBatch.batchId + '" does not exists in registry.');
            }
            //// AND belong to tx issuer
            if (oInputBatch.owner !== getCurrentParticipant()) {
                throw new Error('You are not allowed to manipulate asset: "' + oInputBatch.batchId + '".');
            }
        }
    }

    // business logic
    //// create new material asset(s) AND on success set status of input material/batch to 'PROCESSED'
    ////// use the material type to derive the business rule (BIG switch/case statement)
    let aNewMaterialAssets = [];
    switch (oNewMaterial.type) {
    case 'SCHWEIN': {
        // create new asset
        if (!oNewMaterial.owner) {
            oNewMaterial.owner = getCurrentParticipant();
        }
        oNewMaterial.status = 'CREATED';
        // this is a supply chain graph root node, so add it to the graph node (batch) as a leaf
        // there is only one batch per day so getting the daily batch and add this new material and add batch as reference to material via relationship property
        //const oToday = new Date();
        //oToday.setHours(2, 0, 0, 0);
        //const oBatch = oBatchRegistry.get(oToday);
        //const aBatches = await query('selectDailyBatch', oToday);
        //oNewMaterial.batch = oFactory.newRelationship(NS, 'Batch', oBatch.getIdentifier());
        //batch.materials.push(oNewMaterial);
        //await oBatchRegistry.update(oBatch);

        aNewMaterialAssets.push(oNewMaterial);
        break;
    }
    case 'SCHWEINEHAELFTE': {
        // check for input material/batch, if there is no input material/batch throw Error

        // create new assets
        let oNewMaterial1 = await getFactory().newResource(NS, 'Material', _uuid());
        let oNewMaterial2 = await getFactory().newResource(NS, 'Material', _uuid());
        oNewMaterial1.owner = getCurrentParticipant();
        oNewMaterial1.status = 'CREATED';
        aNewMaterialAssets.push(oNewMaterial1);
        oNewMaterial2.owner = getCurrentParticipant();
        oNewMaterial2.status = 'CREATED';
        aNewMaterialAssets.push(oNewMaterial2);

        // set status of processed material
        for (const oInputMaterial of aInputMaterial) {
            oInputMaterial.status = 'PROCESSED';
        }
        await oMaterialRegistry.updateAll(aInputMaterial);

        for (const oInputBatch of aInputBatch) {
            oInputBatch.status = 'PROCESSED';
            oInputBatch.availableMaterialCount--;
        }
        await oBatchRegistry.updateAll(aInputBatch);
        // these are supply chain graph nodes, so add it to the graph (batch network) with edges


        break;
    }
    default:
        break;
    }

    await oMaterialRegistry.addAll(aNewMaterialAssets);

    // event emitting
    //// create and emit default tx event


    // set return value

}

/**
 * Transport material transaction
 * @param {io.dev.foodchain.transportMaterial} tx
 * @transaction
 */
async function transportMaterial(tx) {
    // input parameter


    // checks
    //// check if proposed input material exists AND belong to tx issuer
    //// check if proposed input batch exists AND belong to tx issuer
    //// check if proposed new material already exists


    // business logic
    ////


    // event emitting
    //// create and emit default tx event


    // set return value

}

/**
 * Change material ownership transaction
 * @param {io.dev.foodchain.changeMaterialOwnership} tx
 * @transaction
 */
async function changeMaterialOwnership(tx) {
    // input parameter
    const oMaterial = tx.material;
    const oNewOwner = tx.newOwner;
    const oActualOwner = tx.material.owner;

    // checks
    //// check if proposed input material exists
    const oMaterialRegistry = await getAssetRegistry(NS + '.Material');
    const bMaterialExists = await oMaterialRegistry.exists(oMaterial.getIdentifier());
    if(!bMaterialExists) {
        throw new Error('Input material "' + oMaterial.getFullyQualifiedName() + '" does not exist in registry.');
    }
    //// AND belong to tx issuer (should be checked by permissions file)
    if (oMaterial.owner !== getCurrentParticipant()) {
        throw new Error('You are not allowed to manipulate asset: "' + oMaterial.getFullyQualifiedName() + '".');
    }
    //// check if proposed new owner exists
    const oParticipantRegistry = await getParticipantRegistry(oNewOwner.getNamespace());
    const bNewOwnerExists = await oParticipantRegistry.exists(oNewOwner.getIdentifier());
    if(!bNewOwnerExists) {
        throw new Error('New owner "' + oNewOwner.getFullyQualifiedName() + '" does not exist in registry.');
    }

    // business logic
    //// put actual owner to the history stack
    oMaterial.ownerHistory.push(oActualOwner);
    //// set new owner for asset
    oMaterial.owner = oNewOwner;
    //// update asset registry
    await oMaterialRegistry.update(oMaterial);

    // event emitting
    //// create and emit default tx event


    // set return value

}

/**
 * Sell material transaction
 * @param {io.dev.foodchain.sellMaterial} tx
 * @transaction
 */
async function sellMaterial(tx) {
    // input parameter


    // checks
    //// check if proposed input material exists AND belong to tx issuer
    //// check if proposed input batch exists AND belong to tx issuer
    //// check if proposed new material already exists


    // business logic
    ////


    // event emitting
    //// create and emit default tx event


    // set return value

}

/*****************************************************************************/
/* Test data functions                                                       */
/*****************************************************************************/

/**
 * Generate mock master data helper function
 * @param {io.dev.foodchain.generateMockMasterData} generateMockMasterData - generateMockMasterData instance
 * @transaction
 */
async function _generateMockMasterData() {
    const oFactory = getFactory();

    const aFarmers = [
        oFactory.newResource(NS, 'Farmer', '1111'),
        oFactory.newResource(NS, 'Farmer', '1112')
    ];

    const aSlaughterhouses = [
        oFactory.newResource(NS, 'Slaughterhouse', '2222')
    ];

    const aCuttingplants = [
        oFactory.newResource(NS, 'CuttingPlant', '3333')
    ];

    const aManufacturers = [
        oFactory.newResource(NS, 'Manufacturer', '4444')
    ];

    const aWholesales = [
        oFactory.newResource(NS, 'Wholesale', '5555')
    ];

    const aRetailers = [
        oFactory.newResource(NS, 'Retailer', '6666')
    ];

    const aConsumers = [
        oFactory.newResource(NS, 'Consumer', 'Consumer_1')
    ];

    aFarmers.forEach(function(oFarmer, index) {
        oFarmer.name = 'FARMER_' + (index + 1);
        const oAddress = oFactory.newConcept(NS, 'Address');
        oAddress.street = 'STREET_' + (index + 1);
        oAddress.number =  'N_' + (index + 1);
        oAddress.postCode = 'POSTCODE_' + (index + 1);
        oAddress.country = 'COUNTRY_' + (index + 1);
        oFarmer.address = oAddress;
        oFarmer.type = 'LANDWIRT';
    });
    const farmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    await farmerRegistry.addAll(aFarmers);

    aSlaughterhouses.forEach(function(slaughterhouse, index) {
        slaughterhouse.name = 'SLAUGHTERHOUSE_' + (index + 1);
        const oAddress = oFactory.newConcept(NS, 'Address');
        oAddress.street = 'STREET_' + (index + 1);
        oAddress.number =  'N_' + (index + 1);
        oAddress.postCode = 'POSTCODE_' + (index + 1);
        oAddress.country = 'COUNTRY_' + (index + 1);
        slaughterhouse.address = oAddress;
        slaughterhouse.type = 'SCHLACHTHOF';
    });
    const slaughterhouseRegistry = await getParticipantRegistry(NS + '.Slaughterhouse');
    await slaughterhouseRegistry.addAll(aSlaughterhouses);

    aCuttingplants.forEach(function(cuttingplant, index) {
        cuttingplant.name = 'CUTTING_PLANT_' + (index + 1);
        const oAddress = oFactory.newConcept(NS, 'Address');
        oAddress.street = 'STREET_' + (index + 1);
        oAddress.number =  'N_' + (index + 1);
        oAddress.postCode = 'POSTCODE_' + (index + 1);
        oAddress.country = 'COUNTRY_' + (index + 1);
        cuttingplant.address = oAddress;
        cuttingplant.type = 'ZERLEGUNG';
    });
    const cuttingPlantRegistry = await getParticipantRegistry(NS + '.CuttingPlant');
    await cuttingPlantRegistry.addAll(aCuttingplants);

    aManufacturers.forEach(function(manufacturer, index) {
        manufacturer.name = 'MANUFACTURER_' + (index + 1);
        const oAddress = oFactory.newConcept(NS, 'Address');
        oAddress.street = 'STREET_' + (index + 1);
        oAddress.number =  'N_' + (index + 1);
        oAddress.postCode = 'POSTCODE_' + (index + 1);
        oAddress.country = 'COUNTRY_' + (index + 1);
        manufacturer.address = oAddress;
        manufacturer.type = 'PRODUKTION';
    });
    const manufacturerRegistry = await getParticipantRegistry(NS + '.Manufacturer');
    await manufacturerRegistry.addAll(aManufacturers);

    aWholesales.forEach(function(wholesale, index) {
        wholesale.name = 'WHOLESALE_' + (index + 1);
        const oAddress = oFactory.newConcept(NS, 'Address');
        oAddress.street = 'STREET_' + (index + 1);
        oAddress.number =  'N_' + (index + 1);
        oAddress.postCode = 'POSTCODE_' + (index + 1);
        oAddress.country = 'COUNTRY_' + (index + 1);
        wholesale.address = oAddress;
        wholesale.type = 'GROSSHANDEL';
    });
    const aWholesalesRegistry = await getParticipantRegistry(NS + '.Wholesale');
    await aWholesalesRegistry.addAll(aWholesales);

    aRetailers.forEach(function(retailer, index) {
        retailer.name = 'RETAILER_' + (index + 1);
        const oAddress = oFactory.newConcept(NS, 'Address');
        oAddress.street = 'STREET_' + (index + 1);
        oAddress.number =  'N_' + (index + 1);
        oAddress.postCode = 'POSTCODE_' + (index + 1);
        oAddress.country = 'COUNTRY_' + (index + 1);
        retailer.address = oAddress;
        retailer.type = 'EINZELHANDEL';
    });
    const retailerRegistry = await getParticipantRegistry(NS + '.Retailer');
    await retailerRegistry.addAll(aRetailers);
}

/**
 * Generate mock transactional data helper function
 * @param {io.dev.foodchain.generateMockTransactionData} generateMockTransactionData - generateMockTransactionData instance
 * @transaction
 */
async function _generateMockTransactionData() {
    const oFactory = getFactory();
    const oFarmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    const aFarmers = await oFarmerRegistry.getAll();

    const oSlaughterhouseRegistry = await getParticipantRegistry(NS + '.Slaughterhouse');
    const aSlaughterhouses = await oSlaughterhouseRegistry.getAll();

    const aMaterials = [
        oFactory.newResource(NS, 'Material', 'Mat_1'),
        oFactory.newResource(NS, 'Material', 'Mat_2'),
        oFactory.newResource(NS, 'Material', 'Mat_3'),
        oFactory.newResource(NS, 'Material', 'Mat_4'),
        oFactory.newResource(NS, 'Material', 'Mat_5'),
        oFactory.newResource(NS, 'Material', 'Mat_6'),
        oFactory.newResource(NS, 'Material', 'Mat_7'),
        oFactory.newResource(NS, 'Material', 'Mat_8')
    ];

    const aMaterialTypes = [
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

    const aMaterialQualities = [
        'LOW',
        'MID',
        'HIGH'
    ];

    const aMaterialStatuses = [
        'CREATED',
        'REGISTERED',
        'AVAILABLE_FOR_PRODUCTION',
        'IN_TRANSIT',
        'PROCESSED'
    ];

    const aBatchStatuses = [
        'CREATED',
        'REGISTERED',
        'AVAILABLE_FOR_PRODUCTION',
        'IN_TRANSIT',
        'PROCESSED'
    ];

    const aBatches = [
        oFactory.newResource(NS, 'Batch', '1'),
        oFactory.newResource(NS, 'Batch', '2'),
        oFactory.newResource(NS, 'Batch', '3')
    ];

    const aBatchNetworks = [
        oFactory.newResource(NS, 'BatchNetwork', '1')
    ];

    aMaterials[0].type = aMaterialTypes[0];
    aMaterials[0].quality = aMaterialQualities[2];
    aMaterials[0].status = aMaterialStatuses[4];
    aMaterials[0].bonus = true;
    aMaterials[0].owner = oFactory.newRelationship(NS, 'Farmer', aFarmers[0].getIdentifier());

    aMaterials[1].type = aMaterialTypes[0];
    aMaterials[1].quality = aMaterialQualities[2];
    aMaterials[1].status = aMaterialStatuses[4];
    aMaterials[1].bonus = true;
    aMaterials[1].owner = oFactory.newRelationship(NS, 'Farmer', aFarmers[0].getIdentifier());

    aMaterials[2].type = aMaterialTypes[0];
    aMaterials[2].quality = aMaterialQualities[2];
    aMaterials[2].status = aMaterialStatuses[4];
    aMaterials[2].bonus = true;
    aMaterials[2].owner = oFactory.newRelationship(NS, 'Farmer', aFarmers[0].getIdentifier());

    aMaterials[3].type = aMaterialTypes[0];
    aMaterials[3].quality = aMaterialQualities[2];
    aMaterials[3].status = aMaterialStatuses[4];
    aMaterials[3].bonus = true;
    aMaterials[3].owner = oFactory.newRelationship(NS, 'Farmer', aFarmers[1].getIdentifier());

    aMaterials[4].type = aMaterialTypes[0];
    aMaterials[4].quality = aMaterialQualities[2];
    aMaterials[4].status = aMaterialStatuses[4];
    aMaterials[4].bonus = true;
    aMaterials[4].owner = oFactory.newRelationship(NS, 'Farmer', aFarmers[1].getIdentifier());

    aMaterials[5].type = aMaterialTypes[0];
    aMaterials[5].quality = aMaterialQualities[2];
    aMaterials[5].status = aMaterialStatuses[4];
    aMaterials[5].bonus = true;
    aMaterials[5].owner = oFactory.newRelationship(NS, 'Farmer', aFarmers[1].getIdentifier());

    aMaterials[6].type = aMaterialTypes[1];
    aMaterials[6].quality = aMaterialQualities[2];
    aMaterials[6].status = aMaterialStatuses[2];
    aMaterials[6].owner = oFactory.newRelationship(NS, 'Slaughterhouse', aSlaughterhouses[0].getIdentifier());

    aMaterials[7].type = aMaterialTypes[1];
    aMaterials[7].quality = aMaterialQualities[2];
    aMaterials[7].status = aMaterialStatuses[2];
    aMaterials[7].owner = oFactory.newRelationship(NS, 'Slaughterhouse', aSlaughterhouses[0].getIdentifier());

    const oMaterialRegistry = await getAssetRegistry(NS + '.Material');
    await oMaterialRegistry.addAll(aMaterials);

    let oTimestamp = new Date();
    oTimestamp.setHours(2, 0, 0, 0,);
    aBatches[0].timestamp = oTimestamp;
    aBatches[0].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[0].getIdentifier()));
    aBatches[0].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[1].getIdentifier()));
    aBatches[0].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[2].getIdentifier()));
    aBatches[0].description = 'Schweine Charge 1'
    aBatches[0].status = aBatchStatuses[4];
    aBatches[0].availableMaterialCount = 0;

    oTimestamp.setDate(oTimestamp.getDate() - 1);
    aBatches[1].timestamp = oTimestamp;
    aBatches[1].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[3].getIdentifier()));
    aBatches[1].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[4].getIdentifier()));
    aBatches[1].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[5].getIdentifier()));
    aBatches[1].description = 'Schweine Charge 2'
    aBatches[1].status = aBatchStatuses[4];
    aBatches[1].availableMaterialCount = 0;

    oTimestamp.setDate(oTimestamp.getDate() - 2);
    aBatches[2].timestamp = oTimestamp;
    aBatches[2].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[6].getIdentifier()));
    aBatches[2].addArrayValue('materials', oFactory.newRelationship(NS, 'Material', aMaterials[7].getIdentifier()));
    aBatches[2].description = 'Schweinehälften Charge 1'
    aBatches[2].status = aBatchStatuses[2];
    aBatches[2].availableMaterialCount = 0;

    const oBatchRegistry = await getAssetRegistry(NS + '.Batch');
    await oBatchRegistry.addAll(aBatches);

    aBatchNetworks[0].description = 'Chargennetzwerk 1';
    aBatchNetworks[0].addArrayValue('nodes', oFactory.newRelationship(NS, 'Batch', aBatches[0].getIdentifier()));
    aBatchNetworks[0].addArrayValue('nodes', oFactory.newRelationship(NS, 'Batch', aBatches[1].getIdentifier()));
    aBatchNetworks[0].addArrayValue('nodes', oFactory.newRelationship(NS, 'Batch', aBatches[2].getIdentifier()));

    let oEdge_1 = oFactory.newConcept(NS, 'Edge');
    oEdge_1.edgeId = '1'
    oEdge_1.source = oFactory.newRelationship(NS, 'Batch', aBatches[0].getIdentifier());
    oEdge_1.target = oFactory.newRelationship(NS, 'Batch', aBatches[2].getIdentifier());

    let oEdge_2 = oFactory.newConcept(NS, 'Edge');
    oEdge_2.edgeId = '2'
    oEdge_2.source = oFactory.newRelationship(NS, 'Batch', aBatches[1].getIdentifier());
    oEdge_2.target = oFactory.newRelationship(NS, 'Batch', aBatches[2].getIdentifier());

    aBatchNetworks[0].addArrayValue('edges', oEdge_1);
    aBatchNetworks[0].addArrayValue('edges', oEdge_2);

    const oBatchNetworkRegistry = await getAssetRegistry(NS + '.BatchNetwork');
    await oBatchNetworkRegistry.addAll(aBatchNetworks);
}

/**
 * Remove generated mock master data
 * @param {io.dev.foodchain.removeMockMasterData} removeMockMasterData - removeMockMasterData instance
 * @transaction
 */
async function _removeMockMasterData(removeMockMasterData) { // eslint-disable-line no-unused-vars
    const oFarmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    const oSlaughterhouseRegistry = await getParticipantRegistry(NS + '.Slaughterhouse');
    const oCuttingplantRegistry = await getParticipantRegistry(NS + '.CuttingPlant');
    const oManufacturerRegistry = await getParticipantRegistry(NS + '.Manufacturer');
    const oWholesaleRegistry = await getParticipantRegistry(NS + '.Wholesale');
    const oRetailerRegistry = await getParticipantRegistry(NS + '.Retailer');
    const oConsumerRegistry = await getParticipantRegistry(NS + '.Consumer');

    await oFarmerRegistry.removeAll(await oFarmerRegistry.getAll());
    await oSlaughterhouseRegistry.removeAll(await oSlaughterhouseRegistry.getAll());
    await oCuttingplantRegistry.removeAll(await oCuttingplantRegistry.getAll());
    await oManufacturerRegistry.removeAll(await oManufacturerRegistry.getAll());
    await oWholesaleRegistry.removeAll(await oWholesaleRegistry.getAll());
    await oRetailerRegistry.removeAll(await oRetailerRegistry.getAll());
    await oConsumerRegistry.removeAll(await oConsumerRegistry.getAll());
}

/**
 * Remove generated mock transactional data
 * @param {io.dev.foodchain.removeMockTransactionData} removeMockTransactionData - removeMockTransactionData instance
 * @transaction
 */
async function _removeMockTransactionData(removeMockTransactionData) { // eslint-disable-line no-unused-vars
    const oMaterialRegistry = await getAssetRegistry(NS + '.Material');
    const oBatchRegistry = await getAssetRegistry(NS + '.Batch');
    const oBatchNetworkRegistry = await getAssetRegistry(NS + '.BatchNetwork');

    await oMaterialRegistry.removeAll(await oMaterialRegistry.getAll());
    await oBatchRegistry.removeAll(await oBatchRegistry.getAll());
    await oBatchNetworkRegistry.removeAll(await oBatchNetworkRegistry.getAll());

}

/*****************************************************************************/
/* Utility functions                                                         */
/*****************************************************************************/

/**
 * UUID helper function
 * @returns {string} generated pseudo UUID string
 */
function _uuid() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

/**
* GLN helper function
* @returns {string} generated pseudo GLN string
*/
function _gln() {
    const n6 = () => Math.floor(100000 + Math.random() * 900000);
    return `${n6()}`;
}
