export interface Asset {
  _id:string;
  assetType: string; // Using string as ObjectId is typically represented as a string in TypeScript
  company: string;   // Similarly, using string for ObjectId
  assetName: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  status: string;    // Using string for ObjectId
  image?: string;    // Making it optional since it doesn't have a required flag in the Mongoose schema
  customAttributes:CustomAttribute[];
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
export interface AssetStatus {
  _id:string;
  statusName: string;
}

export interface CustomAttribute {
  attributeName: string;
  description: string;
  dataType: string;
  isRequired: boolean;
  value:number;
  _id: string;
}
export interface UpdateCustomAttribute {
  attributeName: string;
  description: string;
  dataType: string;
  isRequired: boolean;
  // company: boolean;
  // assetType:string;
}
export interface AssetAttributeValue{
  _id?:string;
  assetId:string;
  attributeId:string;
  value:string;
}


