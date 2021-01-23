import { Archiver } from "archiver";
import path from 'path';
import fs from 'fs';

// Dotenv
import dotenv from "dotenv";
dotenv.config();

// Environment variables
import { defaultAssetsPath, defaultConfigPath, defaultImagesPath, defaultModulesMappingFile, defaultModulesImagesPath } from './defaults';
const assetsPath: string = path.normalize(process.env.ASSETS_PATH ?? defaultAssetsPath);
const configPath: string = path.normalize(process.env.CONFIG_PATH ?? defaultConfigPath);
const imagesPath: string = path.normalize(process.env.IMAGES_PATH ?? defaultImagesPath);
const modulesMappingFile: string = path.normalize(process.env.MODULE_MAPPING_FILE ?? defaultModulesMappingFile);
const modulesImagesPath: string = path.normalize(process.env.MODULES_IMAGES_PATH ?? defaultModulesImagesPath);

// Data
const modulesData = JSON.parse(fs.readFileSync(path.join(assetsPath, configPath, modulesMappingFile), 'utf8'));

// Figure out which modules to add
export async function addModules(format: string, archive: Archiver, modules: string[]) {

    // For each module
    const promises = modules.map(async (modName) => {
        // If the module exists
        if (modulesData[modName] !== undefined && modulesData[modName] !== null) {
            const obj = JSON.parse(fs.readFileSync(path.join(assetsPath, configPath, modulesImagesPath, modulesData[modName]), 'utf8'));

            // Try to get module path
            let directory;
            try {
                directory = obj[format];
            } catch (e) {
                // If version has no path return
                console.log('Invalid Version: '+e);
                return;
            }
            
            // Make path to files
            const DLPath = path.join(assetsPath, imagesPath, directory);

            // List files
            archive.directory(DLPath, false);
        }
    });
    return Promise.all(promises);
}
