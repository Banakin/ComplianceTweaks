// Module Data
import { addModules } from "./modules";
import { addIconModules } from "./iconModules";
import { addOptionsBG } from "./optionsBGModules";
import { addMenuPanorama } from "./panoramaModules";

// Archiver
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Usefull tools
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

// AWS
import { APIGatewayEvent, Context } from 'aws-lambda';

// GCP Storage Bucket
import { Storage } from "@google-cloud/storage";
const bucket = new Storage({keyFilename: './GCPBucketKey.json'}).bucket('faithfultweaks-app.appspot.com'); // Storage Bucket

// Delete all the genrated packs every day (ABOUT MIDNIGHT EST)
// exports.deletePacks = functions.pubsub.schedule('0 4 * * *').onRun(async (cxt) => {
//     const bucket = admin.storage().bucket(); // Storage bucket

//     // Delete everything in ComplianceTweaks/
//     bucket.deleteFiles({
//         prefix: 'ComplianceTweaks/'
//     }, (err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log('All the zip files ComplianceTweaks/ have been deleted');
//         }
//     });

// });

// Create a zip file from file in storage
export const handler = async (event: APIGatewayEvent, context: Context) => {
    return new Promise(async (resolve, reject) => {
        const tempFilePath = path.join(os.tmpdir(), 'texturepack.zip'); // Zip path

        // Get body data
        const reqBody = JSON.parse(event.body);
        const format: string = reqBody.format;
        const modules: string[] = reqBody.modules;
        const iconModules: string[] = reqBody.iconModules;
        const optionsBackground: string = reqBody.optionsBackground;
        const panoOption: string = reqBody.panoOption;

        // ----- CREATE THE ARCHIVE -----
        const output = fs.createWriteStream(tempFilePath); // create a file to stream archive data to.
        // init zip file
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // Catch warnings
        archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
            console.log("WARNING: "+err);
        } else {
            // throw error
            throw err;
        }
        });

        archive.on('error', (err) => { throw err; }); // Catch errors

        archive.pipe(output); // pipe archive data to the file


        // ----- ADD FILES TO THE ARCHIVE -----
        archive.append(mcMeta(format), {name: 'pack.mcmeta'}); // add mcmeta file
        archive.append(moduleSelection(format, modules, iconModules, optionsBackground, panoOption), {name: 'modules.txt'}); // add modules.txt file
        archive.append(creditsTxt, {name: 'credits.txt'}); // add credits.txt file
        
        // Add pack icon
        archive.file(path.join('images', 'pack.png'), {name: 'pack.png'});
        
        if (modules !== undefined && modules !== null) {
            await addModules(format, archive, modules); // Add modules to the pack
        }

        if (iconModules !== undefined && iconModules !== null) {
            await addIconModules(iconModules, archive); // Add icon modules to icons.png
        }

        if (optionsBackground !== undefined && optionsBackground !== null) {
            await addOptionsBG(optionsBackground, archive); // Add options background
        }
        
        if (panoOption !== undefined && panoOption !== null) {
            await addMenuPanorama(panoOption, archive); // Add menu panorama
        }

        await archive.finalize(); // finalize the archive

        // ----- UPLOAD THE ARCHIVE -----
        const fileID = nanoid();
        const downloadToken = nanoid();

        const newPackPath = path.join('ComplianceTweaks', fileID + '.zip'); // New file upload path

        // Metadata
        const metadata = {
            contentType: 'application/zip',
            metadata: {
                firebaseStorageDownloadTokens: downloadToken,
            }
        };
        
        // Log and upload when file has been made
        output.on('close', async () => {
            console.log('Archiver has been finalized and the output file descriptor has closed. File size: ' + archive.pointer() + ' bytes');
            
            // Actual upload
            await bucket.upload(tempFilePath, {
                destination: newPackPath,
                metadata: metadata,
            }).then((data) => {
                const file = data[0];
                // Respond with URL
                resolve({
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Headers" : "Content-Type",
                        "Access-Control-Allow-Origin": (process.env.NODE_ENV !== 'production' ? '*' : 'https://faithfultweaks.com'),
                        "Access-Control-Allow-Methods": "POST",
                        "Content-Type": 'application/json',
                    },
                    body: JSON.stringify({ "url": "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + downloadToken }),
                });
                fs.unlinkSync(tempFilePath); // Unlink file
                return;
            });
        });

        output.on('end', () => { console.log('Data has been drained'); }); // Log when file is drained
    })
};

// Make the mcmeta file
function mcMeta(format: string) {
    let formatStr = format;

    // Get pack format from version
    let packFormat: number;
    if (format === "1.8") {
        packFormat = 1;
    } else if (format === "1.9" || format === "1.10") {
        packFormat = 2;
    } else if (format === "1.11" || format === "1.12") {
        packFormat = 3;
    } else if (format === "1.13" || format === "1.14") {
        packFormat = 4;
    } else if (format === "1.15" || format === "1.16") {
        packFormat = 5;
    } else if (format === "1.16.2") {
        packFormat = 6;
        formatStr = "1.16.2 - Latest";
    } else {
        packFormat = 1
        formatStr = "Error making pack";
    }

    return (
`{
    "pack": {
        "pack_format": `+packFormat+`,
        "description": "§aCompliance Tweaks §6- §c`+formatStr+`\\n§b§nfaithfultweaks.com"
    }
}`
    );
}

// Make the modules.txt file
function moduleSelection(format: string, modules: string[], iconModules: string[], optionsBackground: string, panoOption: string) {
    // Make string of modules
    let modStr = '';
    if (modules !== undefined && modules !== null) {
        modStr = modStr + '\nPacks:\n';
        modules.forEach((modName) => {
            modStr = modStr + '    '+modName+'\n';
        });
    }

    // Make string of HUD modules
    let hudStr = '';
    if (iconModules !== undefined && iconModules !== null) {
        hudStr = hudStr + '\nHUD Packs:\n';
        iconModules.forEach((hudName) => {
            hudStr = hudStr + '    '+hudName+'\n';
        });
    }

    // Make string with options background
    let optionsStr = '';
    if (optionsBackground !== undefined && optionsBackground !== null) {
        optionsStr = optionsStr + '\nOptions Background:\n';
        optionsStr = optionsStr + '    '+optionsBackground+'\n';
    }

    // Make string with options background
    let panoStr = '';
    if (panoOption !== undefined && panoOption !== null) {
        panoStr = panoStr + '\nPanorama Background:\n';
        panoStr = panoStr + '    '+panoOption+'\n';

    }

    return ('Compliance Tweaks generated pack\nVersion: '+format+'\n'+modStr+hudStr+optionsStr+panoStr);
}

// The credits.txt file contents
const creditsTxt = `Credits:
Vanilla Tweaks by the Vanilla Tweaks team: https://vanillatweaks.net/
Compliance Textures by the Compliance team: https://compliancepack.net/

This pack is a modification of The Compliance 32x pack. 
Modifications are based off of/inspired by the packs by Vanilla tweaks.`
