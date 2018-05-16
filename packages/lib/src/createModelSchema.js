function createModelSchema(basename, modelId) {
  return `$id: ${encodeURI(modelId)}
$schema: http://json-schema.org/draft-07/schema#

title: ${basename}
description: ${basename} model description
type: object  # Change to the desired model type (http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1)

# Add your model properties here:
#
# properties:
#   modelProperty:
#     type: string
#
#   anotherProperty:
#     $ref: AnotherModel  # Reference to another model in the same directory
`
}

module.exports = createModelSchema
