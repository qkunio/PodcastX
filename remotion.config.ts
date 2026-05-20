import path from 'node:path';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setShouldOpenBrowser(false);

/** 素材目录为 assets/，组件内用 staticFile() 引用 */
Config.setPublicDir(path.join(process.cwd(), 'assets'));
