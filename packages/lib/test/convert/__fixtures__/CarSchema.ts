export const CarSchema = {
  $id: 'http://supermodel.io/factory/Car',
  title: 'Article',
  type: 'object',
  properties: {
    manufacturer: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    weight: {
      type: 'integer',
    },
    length: {
      type: 'number',
    },
    available: {
      type: 'boolean',
    },
  },
};

export const EngineSchema = {
  $id: 'http://supermodel.io/factory/parts/Engine',
  title: 'Engine',
  type: 'object',
  properties: {
    volume: {
      type: 'number',
    },
    power: {
      type: 'integer',
    },
  },
};

export const TransmissionSchema = {
  $id: 'http://supermodel.io/factory/parts/Transmission',
  title: 'Transmission',
  type: 'object',
  properties: {
    gears: {
      type: 'number',
    },
  },
};

export const ManufacturerSchema = {
  $id: 'http://supermodel.io/factory/Manufacturer',
  title: 'Manufacturer',
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
};
