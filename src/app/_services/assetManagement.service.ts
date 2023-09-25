import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { project } from '../Project/model/project';
import { baseService } from './base';
import { Asset, AssetAttributeValue, AssetStatus, AssetType, CustomAttribute, UpdateCustomAttribute, Vendor } from '../models/AssetsManagement/Asset';

@Injectable({ providedIn: 'root' })
export class AssetManagementService {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${this.token}`,
    }),
    withCredentials: true,
  };
  constructor(private http: HttpClient) {}
  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  addAsset(asset: Asset): Observable<Asset> {
    var response = this.http.post<Asset>(
      `${environment.apiUrlDotNet}/assetsManagement/assets`,
      asset,
      this.httpOptions
    );
    return response;
  }

  getAllAssets(): Observable<Asset[]> {
    var response = this.http.get<Asset[]>(
      `${environment.apiUrlDotNet}/assetsManagement/assets`,
      this.httpOptions
    );
    return response;
  }

  getAllAssetsByType(id:string): Observable<any> {
    var response = this.http.get<Asset[]>(
      `${environment.apiUrlDotNet}/assetsManagement/assetsByType/${id}`,
      this.httpOptions
    );
    return response;
  }

  getAsset(id: string): Observable<Asset> {
    var response = this.http.get<Asset>(
      `${environment.apiUrlDotNet}/assetsManagement/assets/${id}`,
      this.httpOptions
    );
    return response;
  }

  updateAsset(id: string, asset: Asset): Observable<Asset> {
    var response = this.http.put<Asset>(
      `${environment.apiUrlDotNet}/assetsManagement/assets/${id}`,
      asset,
      this.httpOptions
    );
    return response;
  }

  deleteAsset(id: string): Observable<Asset> {
    var response = this.http.delete<Asset>(
      `${environment.apiUrlDotNet}/assetsManagement/assets/${id}`,
      this.httpOptions
    );
    return response;
  }

  deleteAssetAttributes(assetId: string): Observable<Asset> {
    var response = this.http.delete<Asset>(
      `${environment.apiUrlDotNet}/assetsManagement/assetAttributeValues/asset/${assetId}`,
      this.httpOptions
    );
    return response;
  }

  getAllAssetStatuses(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/assetsManagement/assetStatus`,
      this.httpOptions
    );
  }

  addAssetStatus(status:AssetStatus): Observable<AssetStatus> {
    return this.http.post<AssetStatus>(
      `${environment.apiUrlDotNet}/assetsManagement/assetStatus`,
      status,
      this.httpOptions
    );
  }
  updateAssetStatus(id, status): Observable<any> {
    return this.http.put(
      `${environment.apiUrlDotNet}/assetsManagement/assetStatus/${id}`,
      status,
      this.httpOptions
    );
  }
  getStatusList(): Observable<any> {
    return this.http.get(
      `${environment.apiUrlDotNet}/assetsManagement/assetStatus`,
      this.httpOptions
    );
  }

  deleteAssetStatus(id): Observable<any> {
    return this.http.delete(
      `${environment.apiUrlDotNet}/assetsManagement/assetStatus/${id}`,
      this.httpOptions
    );
  }

  getAllVendors(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/assetsManagement/vendors`,
      this.httpOptions
    );
  }

  addVendor(vendor:Vendor): Observable<Vendor> {
    return this.http.post<Vendor>(
      `${environment.apiUrlDotNet}/assetsManagement/vendors`,
      vendor,
      this.httpOptions
    );
  }
  updateVendor(id, vendor:Vendor): Observable<any> {
    return this.http.put(
      `${environment.apiUrlDotNet}/assetsManagement/vendors/${id}`,
      vendor,
      this.httpOptions
    );
  }

  deleteVendor(id): Observable<any> {
    return this.http.delete(
      `${environment.apiUrlDotNet}/assetsManagement/vendors/${id}`,
      this.httpOptions
    );
  }

  //Asset Types

  getAllAssetTypes(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/assetsManagement/allAssetTypes`,
      this.httpOptions
    );
  }

  addAssetType(assetType:AssetType): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes`,
      assetType,
      this.httpOptions
    );
  }
  updateAssetType(id, assetType:any): Observable<any> {
    return this.http.put(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes/${id}`,
      assetType,
      this.httpOptions
    );
  }
  deleteAssetType(id): Observable<any> {
    return this.http.delete(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes/${id}`,
      this.httpOptions
    );
  }
  //Add custom Attributes
  addCustomAttributes(assetTypeId:string,customAttributes:CustomAttribute[]): Observable<CustomAttribute> {
    return this.http.post<CustomAttribute>(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes/${assetTypeId}/customAttributes`,
      customAttributes,
      this.httpOptions
    );
  }
  //Delete custom Attributes
  deleteCustomAttributes(customAttributeId:string): Observable<any> {
    return this.http.delete<string>(
      `${environment.apiUrlDotNet}/assetsManagement/customAttribute/${customAttributeId}`,
      this.httpOptions
    );
  }

  // Update Custom Attributes
  updateCustomAttribute(customAttributeId:string, customAttributes:UpdateCustomAttribute ): Observable<any> {
    return this.http.put<string>(
      `${environment.apiUrlDotNet}/assetsManagement/customAttributes/${customAttributeId}`, customAttributes,
      this.httpOptions
    );
  }

  // Update Custom Attributes
  upsertCustomAttribute(assetAttributeValue:AssetAttributeValue ): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrlDotNet}/assetsManagement/assetAttributeValues`, assetAttributeValue,
      this.httpOptions
    );
  }

  // Update Custom Attributes
  getAssetTypeCustomAttributes(assetTypeId:string): Observable<any> {
    return this.http.get<string>(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes/${assetTypeId}/customAttributes`, this.httpOptions
    );
  }

  //asset assignments
  getEmployeeAssets(emploieeId:string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/assetsManagement/employeeAssets/${emploieeId}`,
      this.httpOptions
    );
  }

  //asset assignments
  getEmployeeUnAssignedAssets(emploieeId:string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/assetsManagement/unassignedAssets/${emploieeId}`,
      this.httpOptions
    );
  }
  assignAsset(employeeId:string,assetId:String): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrlDotNet}/assetsManagement/employeeAssets`,{
        "Employee": employeeId,
        "Asset": assetId
      },
      this.httpOptions
    );
  }
  unAssignAsset(employeeId:string,assetId:String): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrlDotNet}/assetsManagement/employeeAssets/${employeeId}/${assetId}`,
      this.httpOptions
    );
  }


}
