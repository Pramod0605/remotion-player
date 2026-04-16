import { Config } from "@remotion/cli/config";
import path from "path";

Config.setCodec("h264");
Config.setCrf(18);
Config.setOverwriteOutput(true);
Config.setPublicDir(path.join(process.cwd(), "public"));