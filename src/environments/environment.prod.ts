let apiUrlDotNet="http://ehrmapi-env.eba-nm9akzrd.eu-north-1.elasticbeanstalk.com/";
if(window.location.host.includes('localhost'))
{
  apiUrlDotNet="http://ehrmapi-env.eba-nm9akzrd.eu-north-1.elasticbeanstalk.com/";
}
export const environment = {
  production: true,
  apiUrlDotNet:apiUrlDotNet
};
