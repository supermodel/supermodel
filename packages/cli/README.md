# Supermodel CLI

[<img src="supermodel.svg" width="200">](http://supermodel.io)

The Supermodel CLI is used to manage and work with JSON Schema YAML models from the command line.

For more information about Supermodel visit <https://supermodel.io>.

## Overview
Supermodel JSON Schema models are JSON schemas files written in YAML format. Usually, with one type per one YAML file. See [Supermodel JSON Schema Model](#supermodel-json-schema-model) for more details about the Supermodel Model.


## Installation

```
$ npm i -g supermodel-cli
```

## Getting Started
After the installation, initialize the current directory for the use with Supermodel:

```
$ supermodel init http://acme.com/
```

The first parameter (`http://acme.com/`) of the `init` command should represent your application, team or project domain. This domain will be used as the base path for all the model identifiers created in the initialized supermodel directory. This parameter MUST be in the for of a URI but it doesn't have to be resolvable. 

After you have initialized the supermodel directory, step into it: 

```
$ cd ./supermodel
```

And go ahead and create your first model: 

```
$ supermodel 
model 'MyModel' created as /Users/you/supermodel/MyModel.yaml
```

```
$ ls
MyModel.yaml
```

You can open `MyModel.yaml` in an editor and edit it as necessary. When you are ready to create your next models simply use the `supermodel model create <name>` command again. You can also nest models in directories as long as they are nested under the initial supermodel directory.

Refer to [Supermodel JSON Schema Model](#supermodel-json-schema-model) for more details about the Supermodel Model or learn about some [usage examples](#Usage-Examples)

## JSON Schema Functionality
This CLI tool currently supports the following JSON schema operations:

- **YAML to JSON Conversion**

    Converts JSON Schema in YAML format to JSON format

    ```
    $ supermodel schema json <modelPath>
    ```

- **JSON Schema Validation**

    Validates JSON Schema meta schema (read: validates that your JSON Schema is valid)

    ```
    $ supermodel schema validate <path>
    ```

- **JSON Schema Compilation**

    Compiles multiple Supermodel JSON Schema model files into one

    ```
    $ supermodel schema compile <dir>
    ```

- **Resolve JSON Schema References**

    Resolves all remote `$ref`s in a Supermodel JSON Schema model file, transcluding the referenced definitions in the output schema file

    ```
    $ supermodel schema resolve <modelPath>
    ```

- **Conversion to OpenAPI Specification 2.0**

    Converts Supermodel JSON Schema model to [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) definitions object

    ```
    $ supermodel schema oas2 <modelPath>
    ```

## Usage Examples

### Validate Data Models in CI/CD Pipeline

Supermodel CLI is a CI/CD compliant CLI tool, that is it's `validate-schema` command can be used as a part of CI testing, to validate the data models against its meta schema

```
$ supermodel schema validate <path>
$ echo $?
0
```

### Convert Data Models into Self-contained OpenAPI Spec Definitions Object

```
$ supermodel schema compile <dir> > compiled-data-model.yaml
$ supermodel schema resolve compiled-data-model.yaml > resolved-data-model.yaml
$ supermodel schema oas2 resolved-data-model.yaml
```

## Supermodel JSON Schema Model

A Supermodel model (hereafter just "model") is a plain [JSON Schema (draft 7)](http://json-schema.org/specification.html) schema file in YAML format. It is customary that Supermodel model contains a top-level type definition, its title and it starts with the model (`$id`).

At minimum a Supermodel model file looks like:

```yaml
$id: http://supermodel.io/username/MyModel

title: My Model
type: object
```

A Supermodel model might reference another model as defined in [JSON Schema references with `$ref`](http://json-schema.org/latest/json-schema-core.html#rfc.section.8):


```yaml
$id: http://supermodel.io/username/MyModel

title: My Model
type: object

properties:
  modelProperty:
    $ref: http://supermodel.io/username/AnotherModel
```

If the referenced model `http://supermodel.io/username/AnotherModel` shares the same URI base with the `$id` of the referencing model (in this case `http://supermodel.io/username/MyModel`) a relative identifier might be used:

```yaml
$id: http://supermodel.io/username/MyModel

title: My Model
type: object

properties:
  modelProperty:
    $ref: AnotherModel
```

See [JSON Schema specification](http://json-schema.org/specification.html) for more about JSON Schema references and JSON pointer.

## A Good API Project

Supermodel and Supermodel CLI are Good API (<http://goodapi.co>) non-profit projects, aimed and promoting and improving modern, reusable, and sustainable data modeling.
