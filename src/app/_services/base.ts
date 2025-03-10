export class baseService{
  constructor(){}
  public getToken(){
    return localStorage.getItem('jwtToken');
  }
}

export interface APIResponse<T> {
  status: string;
  data: T;
  message?: string;
}
