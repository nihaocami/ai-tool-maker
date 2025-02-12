#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@hey-api/openapi-ts";
import { makeTools } from "./toolmaker.js";
const program = new Command();

program
  .name("ai-tool-maker")
  .argument("<destination>", "Path to the output directory")
  .argument("<openapiSpec>", "Path to the OpenAPI spec (json) file")
  .action(async (destination, openapiSpec) => {
    try {
      const sdkOutputDir = path.resolve(destination);
      const openAPISpecDir = path.resolve(openapiSpec);

      if (!fs.existsSync(openAPISpecDir)) {
        console.error(`Error: Swagger file not found at ${openAPISpecDir}`);
        process.exit(1);
      }

      await createClient({
        input: openAPISpecDir,
        output: sdkOutputDir,
        plugins: ["@hey-api/client-axios"],
      });

      makeTools(sdkOutputDir);
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  });

program.parse();
