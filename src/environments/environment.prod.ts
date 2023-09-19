let apiUrlDotNet="https://ehrmapi-env.eba-nm9akzrd.eu-north-1.elasticbeanstalk.com/api/v1";
if(window.location.host.includes('localhost'))
{
  apiUrlDotNet="https://ehrmapi-env.eba-nm9akzrd.eu-north-1.elasticbeanstalk.com/api/v1";
}
export const environment = {
  production: true,
  apiUrlDotNet:apiUrlDotNet
};
