import path from 'path';
import { Archiver } from 'archiver';
import fs from 'fs';

// Defaults
import { defaultAssetsPath } from './defaults';

const packFilesPath = "modules/panoramas";
const inPackPath = "assets/minecraft/textures/gui/title/background";

const assetsPath: string = path.normalize(process.env.ASSETS_PATH || defaultAssetsPath);
const folders = JSON.parse(fs.readFileSync(path.join(`./${assetsPath}/config/PanoramaMapping.json`), 'utf8'));

export async function addMenuPanorama(moduleName: string, archive: Archiver){
    // If it exists
    if (folders[moduleName] !== undefined && folders[moduleName] !== null) {
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, folders[moduleName], '0.png'), {name: path.join(inPackPath, 'panorama_0.png')}); // Image 0
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, folders[moduleName], '1.png'), {name: path.join(inPackPath, 'panorama_1.png')}); // Image 1
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, folders[moduleName], '2.png'), {name: path.join(inPackPath, 'panorama_2.png')}); // Image 2
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, folders[moduleName], '3.png'), {name: path.join(inPackPath, 'panorama_3.png')}); // Image 3
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, folders[moduleName], '4.png'), {name: path.join(inPackPath, 'panorama_4.png')}); // Image 4
        archive.file(path.join(`./${assetsPath}/images`, packFilesPath, folders[moduleName], '5.png'), {name: path.join(inPackPath, 'panorama_5.png')}); // Image 5
    }
    return;
};