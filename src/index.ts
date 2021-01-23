// Module Data
import { addModules } from "./modules";
import { addIconModules } from "./iconModules";
import { addOptionsBG } from "./optionsBGModules";
import { addMenuPanorama } from "./panoramaModules";

// Archiver
import archiver from 'archiver';
import path from 'path';

// Usefull tools
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

// Dotenv
import * as dotenv from "dotenv";
dotenv.config();

// Express
import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || '3000';
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// CORS
app.use(cors({
    origin: process.env.NODE_ENV !== 'production' ? '*' : 'https://compliancepack.net',
    allowedHeaders: 'Content-Type',
    methods: "GET",
}));

app.get('/', (req, res) => { res.status(200).send('<h1><a href="https://github.com/ComplianceTweaks/ComplianceTweaks">Compliance Tweaks Server</a></h1>') })

app.get('/makePack', async (req, res) => {
        // Set the file id
        const fileID = nanoid();

        // Get body data
        const format: string = req.body.format;
        const modules: string[] = req.body.modules;
        const iconModules: string[] = req.body.iconModules;
        const optionsBackground: string = req.body.optionsBackground;
        const panoOption: string = req.body.panoOption;

        // ----- CREATE THE ARCHIVE -----
        // const output = fs.createWriteStream(tempFilePath); // create a file to stream archive data to.
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

        res.attachment(`ComplianceTweaks_${fileID}.zip`)
        archive.pipe(res); // pipe archive data to the response


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
        
        // finalize the archive
        await archive.finalize();
        
        // Log and upload when file has been made
        res.on('close', () => { console.log('Archiver has been finalized and the output file descriptor has closed. File size: ' + archive.pointer() + ' bytes') });

        // Log when file is drained
        res.on('drain', () => { console.log('Data has been drained'); });
});

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
        formatStr = "1.16.2 - 1.16.5";
    } else if (format === "1.17") {
        packFormat = 7;
        formatStr = "1.17";
    } else {
        packFormat = 0;
        formatStr = "Error making pack";
    }

    return (
`{
    "pack": {
        "pack_format": `+packFormat+`,
        "description": "§aCompliance Tweaks §6- §c`+formatStr+`\\n§b§ncompliancepack.net/tweaks"
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
Modifications are based off of/inspired by the packs by Vanilla Tweaks.`

// Have express app listen on the set port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});