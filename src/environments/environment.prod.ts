let apiUrlDotNet="";
if(window.location.host.includes('localhost'))
{
  apiUrlDotNet="https://mysterious-brushlands-61431.herokuapp.com/api/v1/";
}
export const environment = {
  production: true,
  apiUrlDotNet:apiUrlDotNet
};
