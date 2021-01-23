import path from 'path';
import { Archiver } from 'archiver';
import fs from 'fs';

// Defaults
import { defaultAssetsPath } from './defaults';

const packFilesPath = "modules/optionsBG";
const inPackName = "options_background.png";
const inPackPath = "assets/minecraft/textures/gui";

const assetsPath: string = path.normalize(process.env.ASSETS_PATH || defaultAssetsPath);
const files = JSON.parse(fs.readFileSync(path.join(`./${assetsPath}/config/OptionsMapping.json`), 'utf8'));

export async function addOptionsBG(moduleName: string, archive: Archiver){
    // If it exists
    if (files[moduleName] !== undefined && files[moduleName] !== null) {
        
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, files[moduleName]), {name: path.join(inPackPath, inPackName)});
    }
    return;
};
