export class baseService{
  constructor(){}
  public getToken(){
    return localStorage.getItem('jwtToken');
  }
}
