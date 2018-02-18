# Supermodel CLI Tool

<http://supermodel.io>


## Usage

### Schema Validation 

```
validate-schema <yamlSchemaFile>  Validate JSON Schema YAML representation
```

Validates a JSON Schema in YAML format against [meta schema](http://json-schema.org/specification.html) 
including any referenced remote schemas ([$ref](http://json-schema.org/latest/json-schema-core.html#rfc.section.8)).

Referenced remote schemas are resolved first from the local file system. The 
parent directory of the `<yamlSchemaFile>` is used as the base path for
resolving referenced schemas.

```
$ ./bin/supermodel validate-schema ./fixtures/supermodel/User.yaml
loaded 'http://supermodel.io/supermodel/Layer' from 'fixtures/supermodel/Layer.yaml'
loaded 'http://supermodel.io/supermodel/Model' from 'fixtures/supermodel/Model.yaml'
loaded 'http://supermodel.io/supermodel/Team' from 'fixtures/supermodel/Team.yaml'
loaded 'http://supermodel.io/supermodel/Address' from 'fixtures/supermodel/Address.yaml'
ok.
```

### Schema Compilation

```
compile-schema <yamlSchemaFile>   Compile JSON Schema YAML representation, resolving every references
```

Compiles the target schema `<yamlSchemaFile>`, resolving its remote schema
 references into one JSON Schema file in YAML format.

Note: Does not validates the target schema file.

```
$ ./bin/supermodel compile-schema ./fixtures/supermodel/Team.yaml > compiled.yaml
$ ./bin/supermodel validate-schema compiled.yaml
ok.
```
