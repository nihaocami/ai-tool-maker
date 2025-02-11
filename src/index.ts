#!/usr/bin/env node

import { Command } from "commander";
import { generate } from "openapi-typescript-codegen";
import path from "path";
import fs from "fs";
import t2z from "ts-to-zod";

const program = new Command();

program
  .name("toolsmith")
  .description("Generate an Axios client from a Swagger file")
  .version("1.0.0")
  .argument("<destination>", "Path to the output directory")
  .argument("<swaggerFile>", "Path to the Swagger file")
  .action(async (destination, swaggerFile) => {
    try {
      const outputDir = path.resolve(destination);
      const swaggerPath = path.resolve(swaggerFile);

      if (!fs.existsSync(swaggerPath)) {
        console.error(`Error: Swagger file not found at ${swaggerPath}`);
        process.exit(1);
      }

      await generate({
        input: swaggerPath,
        output: outputDir,
        httpClient: "axios",
      });
      console.log(`✅ Axios client generated in ${outputDir}`);
    } catch (err) {
      console.error("❌ Error generating client:", err);
      process.exit(1);
    }
  });

program.parse();
