export interface preferenceCategory{
  _id: string;
  name: string;
  description: string;
}
export interface userPreference{
  Id: string;
  category: string;
  preference:string;
  name: string;
  label: string;
  description: string;
  dataType: string;
  preferenceValue: string;
}

//model will be used to post a save request
export interface Preference{
  user: string;
  preference: string;
  preferenceValue: string;
}

