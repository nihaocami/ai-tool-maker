import fs from "fs";
import path from "path";
import { generate } from "ts-to-zod";
import ts from "typescript";
import { splitIntoMultilineString, pascalToCamel } from "./strings.js";

export const makeTools = (sdkSource: string) => {
  console.log("⏳ Generating tools");
  const outputDir = path.join(sdkSource, "..", "tools");
  const sdkPath = path.join(sdkSource, "sdk.gen.ts");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const zodSchemaOutput = path.join(outputDir, "ts.schema.ts");
  const { getZodSchemasFile } = generate({
    sourceText: fs.readFileSync(path.join(sdkSource, "types.gen.ts"), {
      encoding: "utf-8",
    }),
  });

  const zodText = getZodSchemasFile(
    `${path.relative(outputDir, sdkSource).replaceAll("\\", "/")}`
  );

  fs.writeFileSync(zodSchemaOutput, zodText);
  // Read source file
  const sourceCode = fs.readFileSync(sdkPath, "utf8");

  // Create a TypeScript SourceFile
  const sourceFile = ts.createSourceFile(
    sdkSource,
    sourceCode,
    ts.ScriptTarget.ESNext,
    true
  );

  // Store import statements
  const importStatements: string[] = [];

  // Function to find dependencies
  const dependencies = new Map<string, Set<string>>();

  // Function extraction
  const functions: { name: string; code: string; node: ts.Node }[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      // Capture import statements
      const importText = node.getFullText(sourceFile).trim();
      importStatements.push(importText);
    } else if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length === 1 &&
      ts.isVariableDeclaration(node.declarationList.declarations[0])
    ) {
      const declaration = node.declarationList.declarations[0];

      // Check if it's an arrow function
      if (
        declaration.name &&
        declaration.initializer &&
        ts.isArrowFunction(declaration.initializer)
      ) {
        const functionName = declaration.name.getText(sourceFile);
        const functionCode = node.getFullText(sourceFile).trim();

        // Track dependencies
        const usedIdentifiers = new Set<string>();
        function findDependencies(n: ts.Node) {
          if (ts.isIdentifier(n)) {
            usedIdentifiers.add(n.text);
          }
          ts.forEachChild(n, findDependencies);
        }
        findDependencies(declaration.initializer);

        dependencies.set(functionName, usedIdentifiers);
        functions.push({ name: functionName, code: functionCode, node });
      }
    }

    ts.forEachChild(node, visit);
  }

  // Traverse AST
  ts.forEachChild(sourceFile, visit);

  functions.forEach(({ name, node }) => {
    const functionFile = path.join(outputDir, `${name}.ts`);

    // Filter relevant imports
    const functionDeps = Array.from(dependencies.get(name) ?? []);

    const mainArgType = functionDeps[3];
    const jsDoc = ts.getJSDocCommentsAndTags(node);
    let jsDocComment;
    if (jsDoc.length > 0) {
      jsDocComment = jsDoc
        .map((doc) => (ts.isJSDoc(doc) ? doc.comment : ""))
        .filter((comment) => comment !== null)
        .join("\n");
    }
    const schemaName = pascalToCamel(`${mainArgType}Schema`);
    // Write file with imports
    const fileContent = `
import { tool } from "ai";
import { ${schemaName} } from "./ts.schema.ts";
import { ${name}, ${mainArgType} } from "../api";

export default tool({
  description: \`
  ${splitIntoMultilineString(jsDocComment ?? name)}
    \`,
  parameters: ${schemaName},
  execute: async (args : ${mainArgType} ) => {
    return await ${name}(args);
  },
});
    `;
    fs.writeFileSync(functionFile, fileContent);
  });

  console.log("🚀 Finished making your tools");
};
