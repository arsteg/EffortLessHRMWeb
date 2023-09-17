let apiUrlDotNet="https://ehrmapi.azurewebsites.net/api/v1";
if(window.location.host.includes('localhost'))
{
  apiUrlDotNet="https://ehrmapi.azurewebsites.net/api/v1/";
}
export const environment = {
  production: true,
  apiUrlDotNet:apiUrlDotNet
};
