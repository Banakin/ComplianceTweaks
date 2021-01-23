import { Archiver } from "archiver";
import path from 'path';
import fs from 'fs';

// Defaults
import { defaultAssetsPath } from './defaults';

// Get assets folder location
const assetsPath: string = path.normalize(process.env.ASSETS_PATH || defaultAssetsPath);
const modulesData = JSON.parse(fs.readFileSync(path.join(`./${assetsPath}/config/ModuleMapping.json`), 'utf8'));

// Figure out which modules to add
export async function addModules(format: string, archive: Archiver, modules: string[]) {

    // For each module
    const promises = modules.map(async (modName) => {
        // If the module exists
        if (modulesData[modName] !== undefined && modulesData[modName] !== null) {
            const obj = JSON.parse(fs.readFileSync(path.join(`./${assetsPath}/config/modules/`, modulesData[modName]), 'utf8'));

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
            const DLPath = path.join(`./${assetsPath}/images`, directory);

            // List files
            archive.directory(DLPath, false);
        }
    });
    return Promise.all(promises);
}
