let apiUrlDotNet="https://arstegeffortlesshrmapi.azurewebsites.net/api/v1";
if(window.location.host.includes('localhost'))
{
  apiUrlDotNet="https://mysterious-brushlands-61431.herokuapp.com/api/v1/";
}
export const environment = {
  production: true,
  apiUrlDotNet:apiUrlDotNet
};
