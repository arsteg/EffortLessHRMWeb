import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { project } from '../Project/model/project';
import { baseService } from './base';
import { Asset, AssetStatus, Vendor } from '../models/AssetsManagement/Asset';

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
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes`,
      this.httpOptions
    );
  }

  addAssetType(vendor:Vendor): Observable<Vendor> {
    return this.http.post<Vendor>(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes`,
      vendor,
      this.httpOptions
    );
  }
  updateAssetType(id, vendor:Vendor): Observable<any> {
    return this.http.put(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes/${id}`,
      vendor,
      this.httpOptions
    );
  }
  deleteAssetType(id): Observable<any> {
    return this.http.delete(
      `${environment.apiUrlDotNet}/assetsManagement/assetTypes/${id}`,
      this.httpOptions
    );
  }
}
