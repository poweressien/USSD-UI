export interface DeviceCapability {
  supportsUssdUi: boolean;
  protocolVersion: string;
  features: {
    buttons: boolean;
    inputs: boolean;
    navigation: boolean;
    confirmation: boolean;
  };
}

export const SUPPORTED_DEVICE: DeviceCapability = {
  supportsUssdUi: true,
  protocolVersion: "0.1",
  features: { buttons: true, inputs: true, navigation: true, confirmation: true },
};

export const UNSUPPORTED_DEVICE: DeviceCapability = {
  supportsUssdUi: false,
  protocolVersion: "0.1",
  features: { buttons: false, inputs: false, navigation: false, confirmation: false },
};
