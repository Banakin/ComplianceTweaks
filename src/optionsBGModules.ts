import path from 'path';
import { Archiver } from 'archiver';
import fs from 'fs';

// Dotenv
import dotenv from "dotenv";
dotenv.config();

// Environment variables
import { defaultAssetsPath, defaultConfigPath, defaultImagesPath, defaultOptionsBGMappingFile, defaultOptionsBGImagesPath } from './defaults';
const assetsPath: string = path.normalize(process.env.ASSETS_PATH ?? defaultAssetsPath);
const configPath: string = path.normalize(process.env.CONFIG_PATH ?? defaultConfigPath);
const imagesPath: string = path.normalize(process.env.IMAGES_PATH ?? defaultImagesPath);
const optionsBGMappingFile: string = path.normalize(process.env.OPTIONS_BG_MAPPING_FILE ?? defaultOptionsBGMappingFile);
const optionsBGImagesPath: string = path.normalize(process.env.OPTIONS_BG_IMAGES_PATH ?? defaultOptionsBGImagesPath);

const inPackName = "options_background.png";
const inPackPath = "assets/minecraft/textures/gui";

// Data
const files = JSON.parse(fs.readFileSync(path.join(assetsPath, configPath, optionsBGMappingFile), 'utf8'));

export async function addOptionsBG(moduleName: string, archive: Archiver){
    // If it exists
    if (files[moduleName] !== undefined && files[moduleName] !== null) {
        
        archive.file(path.join(assetsPath, imagesPath, optionsBGImagesPath, files[moduleName]), {name: path.join(inPackPath, inPackName)});
    }
    return;
};
