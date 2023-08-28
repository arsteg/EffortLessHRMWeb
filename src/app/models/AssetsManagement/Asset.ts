export interface Asset {
  assetId: string;
  assetType: string; // Using string as ObjectId is typically represented as a string in TypeScript
  company: string;   // Similarly, using string for ObjectId
  assetName: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  status: string;    // Using string for ObjectId
  serialNumber: string;
  cost: number;
  image?: string;    // Making it optional since it doesn't have a required flag in the Mongoose schema
}

export interface AssetStatus {
  statusName: string;
}

// src/app/models/Vendor.ts
export interface Vendor {
  _id:string
  vendorId: string;
  vendorName: string;
  email: string;
  address: string;
  phone: string;
}

// src/app/models/Type.ts
export interface AssetType {
  _id:string;
  typeName: string;
  description: string;
  customAttributes: CustomAttribute[];
}

export interface CustomAttribute {
  attributeName: string;
  description: string;
  dataType: string;
  isRequired: boolean;
}

