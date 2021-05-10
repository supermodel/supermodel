const jsYaml = require('js-yaml');
const fs = require('fs');
const superlib = require('@supermodel/lib');
// const { readYAMLFile } = require('@supermodel/file')
const fsUtils = require('../../lib/fsUtils');
const compileSchema = require('../../lib/compileSchema');
const { resolveSchema } = require('../../lib/resolveSchema');

const INDENTATION = '  ';

const GENERATED_BY_SUPERMODEL = `
${INDENTATION}# DO NOT EDIT
${INDENTATION}# This definitions section is automatically generated by supermodel.io
${INDENTATION}#
${INDENTATION}# http://supermodel.io
${INDENTATION}# https://github.com/supermodel/supermodel-cli
`;

// TODO: Break down the spaghetti
async function runConvertToOAS3(inputPath, oas3Path) {
  try {
    let schemaObject;

    if (fsUtils.isDirectory(inputPath)) {
      schemaObject = await compileSchema(inputPath);
    } else {
      schemaObject = await resolveSchema(inputPath);
    }

    const oas3SchemaObject = superlib.convertToOAS3(schemaObject);
    const lines = jsYaml
      .safeDump(oas3SchemaObject.components.schemas)
      .split(/\r?\n/);

    let oas3definitions = `${GENERATED_BY_SUPERMODEL}${INDENTATION}schemas:\n`;
    lines.forEach(line => {
      oas3definitions = oas3definitions.concat(
        `${INDENTATION}${INDENTATION}${line}\n`,
      );
    });

    if (oas3Path) {
      if (!fs.existsSync(oas3Path)) {
        throw new Error(`Output OAS3 file doesn't exists (${oas3Path})`);
      }

      // Read OAS3 file as string, to preserve formatting
      let oas3Content = fs.readFileSync(oas3Path).toString();
      if (!oas3Content) {
        throw new Error(`Unable to read the output OAS3 file (${oas3Path})`);
      }
      // Remove any previous comments
      oas3Content = oas3Content.replace(GENERATED_BY_SUPERMODEL, '\n');

      const definitionRegex = /\n\s+schemas:[^]*$/; // NOTE: replace everything from the components schemas to the end of file
      if (!oas3Content.match(definitionRegex)) {
        // append new definitions section if none exists
        oas3Content = `${oas3Content}${oas3definitions}\n`;
      } else {
        oas3Content = oas3Content.replace(definitionRegex, oas3definitions);
      }

      fs.writeFileSync(oas3Path, oas3Content);
      console.info(`--> Updated ${oas3Path}`);
    } else {
      console.log(oas3definitions);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

module.exports = runConvertToOAS3;