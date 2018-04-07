# Supermodel CLI

[<img src="supermodel.svg" width="200">](http://supermodel.io)

The Supermodel CLI is used to manage JSON Schema models from the command line.

For more information about Supermodel visit <https://supermodel.io>.

## Overview
This CLI tool enables management and use of Supermodel JSON Schema models.

Supermodel JSON Schema models are JSON schemas files written in YAML format. Usually, with one type per one YAML file.

The CLI tool currently supports the following functionality:

- **YAML to JSON Conversion**

    Converts JSON Schema in YAML format to JSON format

    ```
    $ supermodel json <yamlSchemaFile>
    ```

- **JSON Schema Validation**

    Validates JSON Schema meta schema (read: validates that your JSON Schema is valid)

    ```
    $ supermodel validate-schema <path>
    ```

- **JSON Schema Compilation**

    Compiles multiple Supermodel JSON Schema model files into one

    ```
    $ supermodel compile-schema <dir>
    ```

- **Resolve JSON Schema References**

    Resolves all remote `$ref`s in a Supermodel JSON Schema model file, transcluding the referenced definitions in the output schema file

    ```
    $ supermodel resolve-schema <yamlSchemaFile>
    ```

- **Conversion to OpenAPI Specification 2.0**

    Converts Supermodel JSON Schema model to [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) definitions object

    ```
    $ supermodel oas2 <yamlSchemaFile>
    ```

## Installation

```
$ npm i -g supermodel-cli
```

## Usage

### Validate Data Models in CI/CD Pipeline

Supermodel CLI is a CI/CD compliant CLI tool, that is it's `validate-schema` command can be used as a part of CI testing, to validate the data models against its meta schema

```
$ supermodel validate-schema <path>
$ echo $?
0
```

## A Good API Project

Supermodel and Supermodel CLI are Good API (<http://goodapi.co>) non-profit projects, aimed and promoting and improving modern, reusable, and sustainable data modeling.
